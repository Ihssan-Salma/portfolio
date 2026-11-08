import { spawn } from 'node:child_process';
import { writeFile, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { trafficScenario, trafficScenes, trafficStarts, trafficDuration, getTrafficView } from '../reslot-react/src/traffic-scenario.ts';

const quick = process.argv.includes('--quick');
const noScreenshots = process.argv.includes('--no-screenshots');
const baseUrl = process.env.PORTFOLIO_URL ?? 'http://127.0.0.1:4174/';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const profile = await mkdtemp(path.join(os.tmpdir(), 'traffic-test-'));
const port = 9500 + Math.floor(Math.random() * 1000);
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless', '--disable-gpu', '--no-first-run',
  '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
  '--disable-backgrounding-occluded-windows',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });
let ws;

try {
  let tabs;
  for (let attempt = 0; attempt < 50; attempt++) {
    try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; }
    catch { await sleep(100); }
  }
  assert.ok(tabs?.some(tab => tab.type === 'page'), 'Le navigateur de vérification démarre.');
  ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data), request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    message.error ? request.reject(message.error) : request.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    const timeout = method === 'Page.captureScreenshot' ? 30000 : 15000;
    const timer = setTimeout(() => {
      pending.delete(requestId);
      reject(Error(`La commande navigateur ${method} ne répond pas après ${timeout / 1000} secondes.`));
    }, timeout);
    timer.unref();
    pending.set(requestId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const capture = async name => {
    if (noScreenshots) return;
    const screenshot = await send('Page.captureScreenshot');
    await writeFile(path.join(profile, name), Buffer.from(screenshot.data, 'base64'));
  };
  const waitFor = async (expression, timeout = 10000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      if (await evaluate(expression)) return;
      await sleep(100);
    }
    throw Error('Délai de vérification dépassé : ' + expression);
  };
  const errors = [];
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
  });
  await send('Page.enable');
  await send('Runtime.enable');
  // Une autre fenêtre locale ne doit pas suspendre l’horloge de ce navigateur sans interface.
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${baseUrl.replace(/#.*$/, '')}#experience` });
  const selectEmployer = async name => {
    await waitFor(`!!document.querySelector('#experience .screen-selector button')`);
    await evaluate(`[...document.querySelectorAll('#experience .screen-selector button')].find(button=>button.textContent.toLowerCase().includes(${JSON.stringify(name.toLowerCase())})).click()`);
  };
  await selectEmployer('Autoroutes');
  const inner = expression => `(()=>{const frame=globalThis.document.querySelector('.traffic-card-frame');const document=frame.contentDocument,window=frame.contentWindow;return (${expression})})()`;
  const player = expression => evaluate(inner(expression));
  const time = () => player(`Number(document.querySelector('.eg-progress input').value)`);
  const button = index => player(`document.querySelectorAll('.eg-controls>button')[${index}].click()`);
  const seek = async value => {
    await player(`(()=>{const slider=document.querySelector('.eg-progress input');Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(slider,${JSON.stringify(String(value))});slider.dispatchEvent(new window.Event('input',{bubbles:true}));})()`);
    await sleep(100);
  };
  const setSelect = async (selector, value) => {
    await player(`(()=>{const select=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype,'value').set.call(select,${JSON.stringify(String(value))});select.dispatchEvent(new window.Event('change',{bubbles:true}));})()`);
    await sleep(100);
  };
  const yearSelector = '.traffic-controls select[aria-label="Année de démonstration"]';
  const roadSelector = '.traffic-controls select[aria-label="Tronçon de démonstration"]';
  const sceneIndex = node => {
    const index = trafficScenes.findIndex(scene => scene.node === node);
    assert.ok(index >= 0, `L’étape ${node} est définie.`);
    return index;
  };
  const midpoint = node => {
    const index = sceneIndex(node);
    return trafficStarts[index] + trafficScenes[index].duration * .5;
  };
  const checkDashboard = async (year, road) => {
    const expected = getTrafficView(year, road);
    await waitFor(inner(`!!document.querySelector('.traffic-dashboard[data-year="${year}"][data-road="${road}"]')`));
    const actual = await player(`(()=>{const dashboard=document.querySelector('.traffic-dashboard');const volume=dashboard.querySelector('.traffic-volume'),evolution=dashboard.querySelector('.traffic-evolution');return {counts:[...dashboard.querySelectorAll('.traffic-bars>div')].map(bar=>Number(bar.dataset.count)),volume:Number(volume.dataset.volume??volume.textContent.replace(/[^0-9]/g,'')),evolutionAvailable:evolution.dataset.available==='true',evolutionText:evolution.querySelector('b').textContent}})()`);
    assert.deepEqual(actual.counts, expected.counts, 'Les six créneaux correspondent au filtre sélectionné.');
    assert.equal(actual.volume, expected.volume, 'Le volume affiché correspond à la somme de l’extrait filtré.');
    assert.equal(actual.evolutionAvailable, expected.evolution !== null, 'La comparaison annuelle dépend de la présence d’une référence.');
    if (expected.evolution !== null) {
      const displayed = Number(actual.evolutionText.replace(/[^0-9,.-]/g, '').replace(',', '.'));
      assert.ok(Math.abs(displayed - expected.evolution * 100) <= .051, 'Le pourcentage affiché correspond à l’évolution des extraits.');
    }
    return actual;
  };

  try { await waitFor(`!!document.querySelector('.traffic-card-frame')?.contentDocument?.querySelector('.eg-controls')`); }
  catch (error) {
    console.log(await evaluate(`({url:location.href,selection:[...document.querySelectorAll('#experience .screen-selector button')].map(button=>({text:button.textContent,pressed:button.getAttribute('aria-pressed')})),frames:[...document.querySelectorAll('iframe')].map(frame=>({src:frame.src,visible:frame.checkVisibility(),ready:frame.contentDocument?.readyState,time:frame.contentDocument?.querySelector('.eg-progress input')?.value,intro:!!frame.contentDocument?.querySelector('.eg-intro')}))})`));
    throw error;
  }
  assert.equal(trafficScenes[0].duration, 3, 'La mise en contexte dure trois secondes.');
  await waitFor(inner(`Number(document.querySelector('.eg-progress input').value)>0`), 2000);
  if (await time() >= 3) {
    console.log('Trafic : lecture automatique déjà avancée au chargement du navigateur ; contrôle du contexte après Rejouer.');
    await button(1);
    await waitFor(inner(`!!document.querySelector('.eg-intro')`));
  }
  assert.ok(await time() < 3, 'La lecture démarre automatiquement par la scène de contexte.');
  assert.equal(await player(`document.querySelectorAll('.react-flow__node').length`), trafficScenario.stages.length);
  assert.equal(trafficScenario.stages.length, 9, 'Les neuf étapes du parcours sont présentes.');
  await waitFor(inner(`!document.querySelector('.eg-intro')`), 6000);
  assert.ok(await time() >= 3, 'La lecture quitte la scène de contexte après trois secondes.');
  await button(0);
  const paused = await time();
  await sleep(250);
  assert.equal(await time(), paused, 'La pause stabilise l’horloge.');
  assert.deepEqual(await player(`Array.from(document.querySelector('.eg-controls>label select').options,option=>option.value)`), ['0.5', '1', '1.5'], 'Les trois vitesses prévues sont disponibles.');
  for (const speed of [.5, 1]) {
    await setSelect('.eg-controls>label select', speed);
    assert.equal(await player(`document.querySelector('.eg-controls>label select').value`), String(speed), `La vitesse ${speed}× est sélectionnable.`);
    assert.equal(await time(), paused, 'Changer la vitesse respecte la pause.');
  }
  const pausedIndex = trafficStarts.reduce((last, start, index) => paused >= start ? index : last, 0);
  await button(2);
  assert.equal(await time(), trafficStarts[pausedIndex + 1], 'Étape suivante rejoint exactement le prochain événement.');

  await button(0);
  await player(`document.querySelector('[data-id="sources"]').click()`);
  assert.ok(await player(`!!document.querySelector('.eg-inspector')`), 'Les détails s’ouvrent au clic.');
  const beforeDetails = await time();
  await sleep(300);
  assert.ok(await time() > beforeDetails, 'La consultation des détails ne suspend pas la lecture.');
  await player(`document.querySelector('.eg-inspector button').click()`);
  await selectEmployer('Attijariwafa');
  await sleep(150);
  assert.equal(await evaluate(`document.querySelector('.traffic-card-frame').checkVisibility()`), false, 'Le parcours trafic se masque sur une autre expérience.');
  const hiddenTime = await time();
  await sleep(300);
  assert.equal(await time(), hiddenTime, 'Le lecteur masqué suspend son horloge.');
  await selectEmployer('Autoroutes');
  await waitFor(inner(`Number(document.querySelector('.eg-progress input').value)>${hiddenTime}`));
  await button(0);

  const cleaning = sceneIndex('cleaning');
  await seek(trafficStarts[cleaning] + trafficScenes[cleaning].duration * .12);
  assert.ok(await player(`!!document.querySelector('.eg-token')`), 'Un jeton circule pendant le transfert des données.');
  assert.ok(await player(`!!document.querySelector('[data-id="cleaning"] .eg-card.is-active')`), 'Le nettoyage reçoit le focus actif.');

  await seek(midpoint('dashboard'));
  await setSelect(yearSelector, 2024);
  await setSelect(roadSelector, 'TR-A');
  const initialDashboard = await checkDashboard(2024, 'TR-A');
  await button(0);
  const beforeFilter = await time();
  await setSelect(yearSelector, 2023);
  await setSelect(roadSelector, 'TR-B');
  const changedDashboard = await checkDashboard(2023, 'TR-B');
  assert.notDeepEqual(changedDashboard.counts, initialDashboard.counts, 'Changer les filtres modifie les barres.');
  assert.notEqual(changedDashboard.volume, initialDashboard.volume, 'Changer les filtres modifie le volume.');
  assert.ok(await time() > beforeFilter, 'Les filtres laissent la lecture se poursuivre.');
  await button(2);
  await sleep(250);
  assert.equal(await player(`document.querySelector(${JSON.stringify(yearSelector)}).value`), '2023', 'Le choix manuel de l’année survit au changement de scène.');
  assert.equal(await player(`document.querySelector(${JSON.stringify(roadSelector)}).value`), 'TR-B', 'Le choix manuel du tronçon survit au changement de scène.');
  await checkDashboard(2023, 'TR-B');

  await seek(midpoint('dashboard'));
  await setSelect(yearSelector, 2022);
  await checkDashboard(2022, 'TR-B');
  assert.equal(getTrafficView(2022, 'TR-B').evolution, null);
  assert.match(await player(`document.querySelector('.traffic-dashboard').textContent`), /pas de|sans|indisponible|non disponible|hors.*p[ée]rim[èe]tre/i, 'L’évolution 2022 indique l’absence d’année précédente comparable.');
  assert.doesNotMatch(await player(`document.querySelector('.traffic-dashboard').textContent`), /NaN|Infinity/, 'Aucun taux artificiel lorsque l’année précédente manque.');

  await seek(midpoint('peaks'));
  const peakText = await player(`document.querySelector('.eg-caption').textContent+' '+document.querySelector('.traffic-dashboard').textContent`);
  assert.match(peakText, /observ[ée]|constat|illustratif/i, 'Le pic est présenté comme un constat illustratif.');
  assert.match(peakText, /pas.*pr[ée]vision|pas.*pr[ée]diction|sans.*pr[ée]diction|ne pr[ée]dit|non pr[ée]dictif|aucune pr[ée](?:vision|diction)/i, 'Le pic ne prétend pas prévoir le trafic.');
  await seek(midpoint('insights'));
  assert.ok(await player(`!!document.querySelector('[data-id="insights"] .eg-card.is-active')`));
  assert.doesNotMatch(await player(`document.querySelector('.eg-caption').textContent`), /pr[ée]diction en temps r[ée]el|r[ée]duction de \d+\s*%/i, 'La conclusion ne revendique ni prédiction ni gain inventé.');

  await setSelect(yearSelector, 2024);
  await setSelect(roadSelector, 'TR-A');
  await button(1);
  await setSelect('.eg-controls>label select', 1.5);
  await waitFor(inner(`Number(document.querySelector('.eg-progress input').value)>.5`), 3000);
  assert.equal(await player(`document.querySelector('.eg-controls>label select').value`), '1.5', 'La vitesse 1,5× est active.');
  assert.ok(await time() < 3, 'Rejouer recommence au début du contexte.');
  console.log('Trafic : commandes, filtres, suspension et détails validés ; vérification de la fin de lecture.');
  if (quick) await seek(trafficDuration);
  else {
    try { await waitFor(inner(`document.querySelector('main.eg-player').dataset.finished==='true'`), 60000); }
    catch (error) {
      console.log(await player(`({time:document.querySelector('.eg-progress input').value,speed:document.querySelector('.eg-controls>label select').value,play:document.querySelector('.eg-primary').textContent,hidden:document.hidden,caption:document.querySelector('.eg-caption').textContent})`));
      throw error;
    }
  }
  assert.equal(await time(), trafficDuration, 'La lecture termine exactement à la durée prévue.');
  assert.equal(await player(`document.querySelector('.eg-primary').textContent`), trafficScenario.copy.play, 'La commande revient à Lire en fin de parcours.');
  assert.equal(await player(`document.querySelector('.eg-controls>button:nth-of-type(3)').disabled`), true, 'Étape suivante est désactivée une fois le parcours terminé.');
  await checkDashboard(2024, 'TR-A');
  console.log('Trafic : fin propre et sélection conservée ; vérification de la version bureau.');
  await sleep(800);
  await capture('traffic-desktop.png');
  console.log('Trafic : version bureau validée ; vérification de la caméra et des cartes mobiles.');

  await button(3);
  const overviewFits = inner(`(()=>{const box=document.querySelector('.react-flow').getBoundingClientRect();return [...document.querySelectorAll('.react-flow__node')].every(node=>{const r=node.getBoundingClientRect();return r.left>=box.left-2&&r.right<=box.right+2&&r.top>=box.top-2&&r.bottom<=box.bottom+2})})()`);
  const activeFits = inner(`(()=>{const box=document.querySelector('.react-flow').getBoundingClientRect(),card=document.querySelector('.eg-card.is-active');if(!card)return false;const r=card.getBoundingClientRect();return r.width>=Math.min(box.width*.65,200)&&r.left>=box.left-2&&r.right<=box.right+2&&r.top>=box.top-2&&r.bottom<=box.bottom+2})()`);
  const activeContentFits = () => player(`(()=>{const card=document.querySelector('.eg-card.is-active');return card.scrollHeight<=card.clientHeight+1})()`);
  const cleaningIssue = trafficScenes.findIndex(scene => scene.node === 'cleaning' && scene.issue);
  assert.ok(cleaningIssue >= 0, 'Le nettoyage comporte une branche de vérification.');
  await waitFor(overviewFits, 5000);
  for (const width of [390, 320]) {
    console.log(`Trafic : vérification mobile ${width} px.`);
    await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
    await sleep(1000);
    assert.equal(await evaluate(`document.documentElement.scrollWidth>innerWidth`), false, `Le portfolio ne déborde pas horizontalement à ${width} px.`);
    assert.equal(await player(`document.documentElement.scrollWidth>window.innerWidth`), false, `Le lecteur ne déborde pas horizontalement à ${width} px.`);
    await waitFor(overviewFits, 5000);
    assert.ok(await player(`['.eg-controls','.eg-progress'].every(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return r.top>=0&&r.bottom<=window.innerHeight+1})`), `Commandes et progression restent dans le lecteur à ${width} px.`);
    assert.ok(await evaluate(`document.querySelector('.traffic-card-frame').getBoundingClientRect().bottom<=document.querySelector('footer').getBoundingClientRect().top+1`), `Le lecteur reste au-dessus du pied de page à ${width} px.`);
    await capture(`traffic-mobile-${width}.png`);
    await button(3);
    await seek(midpoint('dashboard'));
    await waitFor(activeFits, 5000);
    await checkDashboard(2024, 'TR-A');
    assert.ok(await activeContentFits(), `Le contenu du tableau de bord tient dans la carte à ${width} px.`);
    await capture(`traffic-mobile-${width}-dashboard.png`);
    await seek(trafficStarts[cleaningIssue] + trafficScenes[cleaningIssue].duration * .5);
    await waitFor(activeFits, 5000);
    assert.ok(await activeContentFits(), `Le nettoyage et ses deux branches tiennent dans la carte à ${width} px.`);
    assert.equal(await player(`document.querySelectorAll('.traffic-cleaning-branch circle').length`), 2, 'Les deux décisions du nettoyage reçoivent un jeton.');
    await capture(`traffic-mobile-${width}-cleaning.png`);
    await button(3);
  }

  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: new URL('reslot-react/dist/index.html?project=traffic', baseUrl).href });
  await waitFor(`!!document.querySelector('.traffic-paper .eg-player')`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.traffic-paper .eg-player')).backgroundColor`), 'rgb(0, 0, 0)', 'La version autonome reprend la palette noire du portfolio.');
  await evaluate(`(()=>{const slider=document.querySelector('.eg-progress input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(slider,${JSON.stringify(String(midpoint('dashboard')))});slider.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  await waitFor(`!!document.querySelector('.traffic-dashboard')`);
  await sleep(800);
  await capture('traffic-paper.png');
  console.log('Trafic : cartes mobiles et palette noire validées ; vérification du mouvement réduit.');

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 844, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${baseUrl.replace(/#.*$/, '')}#experience` });
  await selectEmployer('Autoroutes');
  await waitFor(`!!document.querySelector('.traffic-card-frame')?.contentDocument?.querySelector('.eg-intro')`);
  await sleep(300);
  assert.equal(await time(), 0, 'Le mode mouvement réduit démarre en pause.');
  await button(1);
  await sleep(300);
  assert.equal(await player(`document.querySelector('.eg-primary').textContent`), trafficScenario.copy.play, 'Rejouer respecte le mouvement réduit.');
  assert.equal(await player(`document.getAnimations().filter(animation=>animation.playState==='running').length`), 0, 'Aucune animation continue en mouvement réduit.');
  await seek(midpoint('dashboard'));
  await setSelect(yearSelector, 2023);
  await setSelect(roadSelector, 'TR-B');
  await checkDashboard(2023, 'TR-B');
  assert.equal(await player(`document.getAnimations().filter(animation=>animation.playState==='running').length`), 0, 'Les filtres restent utilisables sans mouvement.');
  await capture('traffic-reduced-motion.png');
  assert.deepEqual(errors, [], 'Aucune exception JavaScript dans le navigateur.');
  console.log(`Trafic : ${quick ? 'vérification rapide' : `lecture complète de ${trafficDuration} s à 1,5×`}, filtres déterministes, fin propre, caméra mobile et mouvement réduit validés. ${noScreenshots ? 'Captures désactivées.' : `Captures : ${profile}`}`);
} finally {
  ws?.close();
  browser.kill();
}
