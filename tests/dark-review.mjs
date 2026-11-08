import { spawn } from 'node:child_process';
import { writeFile, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const noScreenshots = process.argv.includes('--no-screenshots');
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
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);const p=pending.get(m.id);if(p){pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(m.error):p.resolve(m.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;const timer=setTimeout(()=>{pending.delete(requestId);reject(Error('Browser request timed out: '+method))},method==='Page.captureScreenshot'?30000:15000);timer.unref();pending.set(requestId,{resolve,reject,timer});ws.send(JSON.stringify({id:requestId,method,params}));});
  const capture=async name=>{if(!noScreenshots)await writeFile(path.join(profile,name),Buffer.from((await send('Page.captureScreenshot')).data,'base64'))};
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');
  // Keep the headless page visible even when another local browser gains focus.
  await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1200,height:800,deviceScaleFactor:1,mobile:false});
  const errors=[];await send('Runtime.enable');
  ws.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails)});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await send('Page.navigate',{url:'http://127.0.0.1:4174/'});
  const waitFor=async(expression)=>{for(let i=0;i<120;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Not ready: '+expression)};
  await waitFor(`!!document.querySelector('.screen-pager')`);
  await evaluate(`Promise.all([...document.querySelectorAll('img[src*="assets/"]')].map(async img=>{img.loading='eager';try{await img.decode()}catch{}}))`);
  assert.equal(await evaluate(`getComputedStyle(document.documentElement).colorScheme`),'dark');
  assert.equal(await evaluate(`getComputedStyle(document.body).color`),'rgb(255, 255, 255)');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.hero-actions .button-primary')).backgroundColor`),'rgb(204, 0, 255)');
  assert.equal(await evaluate(`document.querySelector('footer').textContent.trim()`),'');
  const fontReport=await evaluate(`({body:getComputedStyle(document.body).fontFamily,heading:getComputedStyle(document.querySelector('.hero-name')).fontFamily,navigation:getComputedStyle(document.querySelector('.site-header nav a')).fontFamily,registered:[...document.fonts].filter(face=>face.family.includes('Normal')).map(face=>({family:face.family,status:face.status}))})`);
  await send('DOM.enable');await send('CSS.enable');
  const dom=await send('DOM.getDocument');
  const heroNode=await send('DOM.querySelector',{nodeId:dom.root.nodeId,selector:'.hero-name'});
  const actualFonts=await send('CSS.getPlatformFontsForNode',{nodeId:heroNode.nodeId});
  console.log('Font report: '+JSON.stringify({...fontReport,actualHeadingFonts:actualFonts.fonts}));
  const paletteFindings=[];
  for(const width of [1440,768,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const section of ['top','projets','technologies','experience','certifications','apropos','engagements','contact']){
      await evaluate(`document.querySelector('nav a[href="#${section}"]').click()`);
      await new Promise(r=>setTimeout(r,250));
      const layout=await evaluate(`(()=>{const panel=document.getElementById('${section}');return {body:getComputedStyle(document.body).backgroundColor,color:getComputedStyle(panel).color,overflow:document.documentElement.scrollWidth>innerWidth,panelOverflow:panel.scrollWidth>panel.clientWidth+1}})()`);
      assert.equal(layout.overflow,false,`${section} ${width}: root horizontal overflow`);
      assert.equal(layout.panelOverflow,false,`${section} ${width}: panel horizontal overflow`);
      assert.equal(layout.body,'rgb(0, 0, 0)');
      if(section==='projets'||section==='experience'){
        const selector=section==='experience'?'.banking-card-frame':'.reactflow-card-frame';
        await waitFor(`!!document.querySelector('${selector}')?.contentDocument?.querySelector('.eg-player')`);
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('${selector}').contentDocument.querySelector('.eg-player')).backgroundColor`),'rgb(0, 0, 0)');
        assert.equal(await evaluate(`getComputedStyle(document.querySelector('${selector}').contentDocument.querySelector('.eg-primary')).backgroundColor`),'rgb(204, 0, 255)');
        if(width===1440)console.log('Workflow font '+selector+': '+await evaluate(`getComputedStyle(document.querySelector('${selector}').contentDocument.querySelector('.eg-player')).fontFamily`));
        await evaluate(`(()=>{const frame=document.querySelector('${selector}'),input=frame.contentDocument.querySelector('input');Object.getOwnPropertyDescriptor(frame.contentWindow.HTMLInputElement.prototype,'value').set.call(input,'26');input.dispatchEvent(new frame.contentWindow.Event('input',{bubbles:true}));})()`);
        await new Promise(r=>setTimeout(r,150));
      }
      if(width===1440){const colors=await evaluate(`(()=>{const panel=document.getElementById('${section}');const allowed=color=>{const values=color.match(/[\\d.]+/g)?.map(Number);return !values||values[3]===0||values.slice(0,3).every(value=>value===0)||values.slice(0,3).every(value=>value===255)||values[0]===204&&values[1]===0&&values[2]===255};return [...panel.querySelectorAll('*')].filter(el=>el.checkVisibility()&&el.getBoundingClientRect().top<innerHeight&&el.getBoundingClientRect().bottom>0).flatMap(el=>{const style=getComputedStyle(el);return ['color','backgroundColor','borderTopColor'].filter(property=>!allowed(style[property])).map(property=>({element:el.tagName.toLowerCase()+'.'+el.classList.value,property,value:style[property]}))}).slice(0,20)})()`);if(colors.length)paletteFindings.push({section,colors})}
      await capture(`${section}-${width}.png`);
    }
  }
  await evaluate(`document.querySelector('nav a[href="#top"]').click()`);
  await evaluate(`document.querySelector('.menu-toggle').click()`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.site-header nav')).backgroundColor`),'rgb(0, 0, 0)');
  await capture('menu-mobile.png');
  await evaluate(`document.querySelector('.menu-toggle').click()`);
  // Retry only images that failed the initial all-at-once eager-load burst.
  await evaluate(`Promise.all([...document.querySelectorAll('img[src*="assets/logos/"]')].filter(img=>!img.complete||!img.naturalWidth).map(async img=>{img.loading='eager';const retry=new URL(img.src);retry.searchParams.set('qaRetry','1');img.src=retry.href;try{await img.decode()}catch{}}))`);
  console.log('Palette audit: '+JSON.stringify(paletteFindings));
  const logos=await evaluate(`[...document.querySelectorAll('img[src*="assets/logos/"]')].filter(img=>!img.complete||!img.naturalWidth).map(img=>img.getAttribute('src'))`);
  assert.deepEqual(logos,[],'all local logos load');
  assert.ok(await evaluate(`document.querySelector('[data-i18n="ramadanContext"]').textContent.includes('RAG')`));
  assert.ok(await evaluate(`document.querySelector('[data-i18n="aidantContext"]').textContent.includes('planning partagé')`));
  await evaluate(`document.querySelector('[data-language-toggle]').click()`);
  await new Promise(r=>setTimeout(r,200));
  assert.equal(await evaluate(`document.documentElement.lang`),'en');
  await evaluate(`document.querySelector('[data-language-toggle]').click()`);
  await new Promise(r=>setTimeout(r,200));
  assert.deepEqual(errors,[],'no runtime exceptions');
  console.log('Black/white/purple review passed: eight sections, desktop/mobile, logos, workflow theme, language switch. '+(noScreenshots?'Screenshots skipped.':'Captures: '+profile));
} finally {ws?.close();browser.kill();}
