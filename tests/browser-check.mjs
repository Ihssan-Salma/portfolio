// Dependency-free Chromium smoke test using the DevTools protocol.
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const profile = await mkdtemp(path.join(os.tmpdir(), 'porte-browser-'));
const browser = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless','--disable-gpu','--no-first-run','--remote-debugging-port=9337',`--user-data-dir=${profile}`,'about:blank'], {stdio:'ignore',windowsHide:true});
let ws;
try {
  let tabs;
  for(let i=0;i<50;i++){try{tabs=await (await fetch('http://127.0.0.1:9337/json')).json();break;}catch{await new Promise(r=>setTimeout(r,100));}}
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map();
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(pending.has(m.id)){const {resolve,reject}=pending.get(m.id);pending.delete(m.id);m.error?reject(m.error):resolve(m.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await send('Page.enable');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const report=[];
  for(const width of [1440,390,320]){
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url:'http://127.0.0.1:4174/'});
    await new Promise(r=>setTimeout(r,3000));
    await evaluate('document.fonts.ready');
    await evaluate('Promise.all([...document.images].map(i=>{i.loading="eager";return i.decode().catch(()=>null)}))');
    await evaluate('(async()=>{for(const i of document.images){if(!i.naturalWidth){i.src=i.src.split("?")[0]+"?retry=1";await i.decode().catch(()=>null)}}})()');
    const metrics=await evaluate(`({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,animations:document.getAnimations().length})`);
    if(metrics.overflow||metrics.broken)throw new Error(JSON.stringify(metrics));
    report.push(metrics);
    for(const section of ['top','projets']){
      await evaluate(`document.querySelector('#${section}').scrollIntoView({behavior:'instant'})`);
      const shot=await send('Page.captureScreenshot',{format:'png'});
      await writeFile(path.join(profile,`${width}-${section}.png`),Buffer.from(shot.data,'base64'));
    }
  }
  console.log(JSON.stringify({report,screenshots:profile}));
  await send('Browser.close');
} finally {ws?.close();browser.kill();}
