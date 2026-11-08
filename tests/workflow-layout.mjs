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
  await send('Page.navigate',{url:'http://127.0.0.1:4174/#projets'});
  const waitFor=async(expression)=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw Error('Timeout: '+expression)};
  await waitFor(`!!document.querySelector('#projets .screen-selector button')`);
  for(const project of ['expressions','agile','egrading']){
    const frameClass=project==='expressions'?'facial':project;
    await evaluate(`[...document.querySelectorAll('#projets .screen-selector button')].find(button=>button.textContent.toLowerCase().includes('${project}')).click()`);
    await waitFor(`!!document.querySelector('.${frameClass}-card-frame')?.contentDocument?.querySelector('.eg-controls')`);
    await evaluate(`(()=>{const frame=document.querySelector('.${frameClass}-card-frame'),doc=frame.contentDocument,slider=doc.querySelector('input');Object.getOwnPropertyDescriptor(frame.contentWindow.HTMLInputElement.prototype,'value').set.call(slider,slider.max);slider.dispatchEvent(new frame.contentWindow.Event('input',{bubbles:true}));})()`);
    for(const [width,height] of [[1200,800],[1366,768],[1024,600],[390,844],[320,844]]){
      await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
      await new Promise(r=>setTimeout(r,900));
      const layout=await evaluate(`(()=>{const frame=document.querySelector('.${frameClass}-card-frame'),box=frame.getBoundingClientRect(),doc=frame.contentDocument,controls=doc.querySelector('.eg-controls').getBoundingClientRect(),progress=doc.querySelector('.eg-progress').getBoundingClientRect();return {frameBottom:box.bottom,footerTop:document.querySelector('footer').getBoundingClientRect().top,controlsBottom:box.top+controls.bottom,progressBottom:box.top+progress.bottom,frameHeight:box.height,innerProgress:progress.bottom,innerWidth:frame.contentWindow.innerWidth,scrollWidth:doc.documentElement.scrollWidth}})()`);
      assert.ok(layout.frameBottom<=layout.footerTop,`${project} ${width}x${height}: frame above footer ${JSON.stringify(layout)}`);
      assert.ok(layout.controlsBottom<=layout.footerTop,`${project}: playback buttons visible`);
      assert.ok(layout.progressBottom<=layout.footerTop,`${project}: scrubber visible above footer`);
      assert.ok(layout.innerProgress<=layout.frameHeight,`${project}: scrubber inside iframe`);
      assert.ok(layout.scrollWidth<=layout.innerWidth,`${project}: no horizontal overflow`);
      if(project==='expressions'&&width===1024)await writeFile(path.join(profile,'controls-short-desktop.png'),Buffer.from((await send('Page.captureScreenshot')).data,'base64'));
    }
  }
  console.log('Layout passed: playback controls and scrubber above footer for three workflows at five desktop/mobile sizes. Screenshot: '+path.join(profile,'controls-short-desktop.png'));
} finally {ws?.close();browser.kill();}
