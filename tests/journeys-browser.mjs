import { spawn } from 'node:child_process';
import { writeFile, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const profile = await mkdtemp(path.join(os.tmpdir(), 'reslot-test-'));
const port = 9500 + Math.floor(Math.random()*1000);
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless','--disable-gpu','--no-first-run','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore',windowsHide:true});
let ws;
try {
  let tabs;
  for(let i=0;i<50;i++){try{tabs=await(await fetch(`http://127.0.0.1:${port}/json`)).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map();
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');
  // Keep the headless page visible even when another local browser gains focus.
  await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1200,height:800,deviceScaleFactor:1,mobile:false});
  const waitFor=async(expression,timeout=10000)=>{const until=Date.now()+timeout;while(Date.now()<until){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timeout: '+expression)};
  const errors=[];await send('Runtime.enable');
  ws.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails)});
  for(const project of ['reslot','soc'].filter(project=>!process.env.WORKFLOW_PROJECT||project===process.env.WORKFLOW_PROJECT)){
    const frameSelector=project==='soc'?'.soc-card-frame':'.reactflow-card-frame',duration=project==='soc'?67:70;
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    await send('Emulation.setDeviceMetricsOverride',{width:1200,height:800,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url:'http://127.0.0.1:4174/#projets'});
    await waitFor(`!!document.querySelector('#projets .screen-selector button')`);
    await evaluate(`[...document.querySelectorAll('#projets .screen-selector button')].find(button=>button.textContent.toLowerCase().includes('${project}')).click()`);
    await waitFor(`!!document.querySelector('${frameSelector}')?.contentDocument?.querySelector('.eg-intro')`);
    const inner=expression=>`(()=>{const frame=globalThis.document.querySelector('${frameSelector}');const document=frame.contentDocument,window=frame.contentWindow;return (${expression})})()`;
    const player=expression=>evaluate(inner(expression));
    await waitFor(inner(`Number(document.querySelector('input').value)>3`),6000);
    await player(`document.querySelector('.eg-primary').click()`);
    const paused=await player(`document.querySelector('input').value`);await new Promise(r=>setTimeout(r,200));
    assert.equal(await player(`document.querySelector('input').value`),paused);
    assert.equal(await player(`document.querySelectorAll('.react-flow__node').length`),11);
    await player(`document.querySelector('[data-id="${project==='soc'?'logs':'calendar'}"]').click()`);
    assert.ok(await player(`!!document.querySelector('.eg-inspector')`));
    await player(`document.querySelector('.eg-inspector button').click()`);
    await player(`document.querySelectorAll('.eg-controls>button')[2].click()`);
    assert.equal(await player(`document.querySelector('input').value`),'6');
    const seek=async time=>{await player(`(()=>{const slider=document.querySelector('input');Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set.call(slider,'${time}');slider.dispatchEvent(new window.Event('input',{bubbles:true}));})()`);await new Promise(r=>setTimeout(r,120));};
    if(project==='reslot'){
      await player(`(()=>{const select=document.querySelector('[aria-label="Réponse à la première offre"]');select.value='timeout';select.dispatchEvent(new window.Event('change',{bubbles:true}));})()`);
      await seek(33);assert.match(await player(`document.querySelector('.eg-caption').textContent`),/expirée|écoulé/);
      assert.ok(await player(`!!document.querySelector('.journey-offer.is-issue')`));
    } else {
      await seek(60);
      await player(`document.querySelectorAll('.journey-decisions button')[1].click()`);
      assert.match(await player(`document.querySelector('.journey-decisions [role=status]').textContent`),/Approfondir/);
    }
    await player(`document.querySelectorAll('.eg-controls>button')[1].click()`);
    if(project==='soc')assert.equal(await player(`document.querySelector('.journey-decisions')`),null);
    await player(`(()=>{const select=document.querySelector('select');select.value='1.5';select.dispatchEvent(new window.Event('change',{bubbles:true}));})()`);
    console.log(project+': controls, details and specific interactions passed; checking '+(process.argv.includes('--quick')?'targeted states':'full playback'));
    if(process.argv.includes('--quick'))await seek(duration);else await waitFor(inner(`document.querySelector('main').dataset.finished==='true'`),55000);
    assert.equal(await player(`document.querySelector('input').value`),String(duration));
    assert.equal(await player(`document.querySelector('.eg-primary').textContent`),'Lire');
    await new Promise(r=>setTimeout(r,800));
    await writeFile(path.join(profile,project+'-desktop.png'),Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
    await player(`document.querySelectorAll('.eg-controls>button')[3].click()`);
    const fits=inner(`(()=>{const box=document.querySelector('.react-flow').getBoundingClientRect();return [...document.querySelectorAll('.react-flow__node')].every(node=>{const r=node.getBoundingClientRect();return r.left>=box.left-2&&r.right<=box.right+2&&r.top>=box.top-2&&r.bottom<=box.bottom+2})})()`);
    await waitFor(fits);
    for(const width of [390,320]){
      await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:false});
      await waitFor(fits);
      assert.ok(await player(`document.querySelector('.eg-progress').getBoundingClientRect().bottom<=window.innerHeight`),'progress visible');
      assert.ok(await evaluate(`document.querySelector('${frameSelector}').getBoundingClientRect().bottom<=document.querySelector('footer').getBoundingClientRect().top`),'player above footer');
      assert.ok(await player(`document.documentElement.scrollWidth<=window.innerWidth`));
    }
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
    await player(`document.querySelectorAll('.eg-controls>button')[1].click()`);await new Promise(r=>setTimeout(r,300));
    assert.equal(await player(`document.querySelector('.eg-primary').textContent`),'Lire');
    assert.equal(await player(`document.getAnimations().filter(animation=>animation.playState==='running').length`),0);
    await seek(duration);await new Promise(r=>setTimeout(r,150));
    await player(`document.querySelectorAll('.eg-controls>button')[3].click()`);await new Promise(r=>setTimeout(r,150));
    await writeFile(path.join(profile,project+'-mobile.png'),Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
    console.log(project+': finish, mobile, footer bounds, replay and reduced motion passed.');
  }
  assert.deepEqual(errors,[]);
  console.log('Screenshots: '+profile);
} finally {ws?.close();browser.kill();}
