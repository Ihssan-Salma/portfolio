// Real Chromium input and media smoke tests; no production test hooks.
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const temp=await mkdtemp(path.join(os.tmpdir(),'porte-cinema-'));
const process=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless','--disable-gpu','--no-first-run','--autoplay-policy=no-user-gesture-required','--remote-debugging-port=0',`--user-data-dir=${temp}`,'about:blank'],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws;
try{
  let tabs;for(let i=0;i<60;i++){try{const port=(await readFile(path.join(temp,'DevToolsActivePort'),'utf8')).split('\n')[0];tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();break;}catch{await delay(100);}}
  ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  let id=0;const queue=new Map(),events=new Map(),errors=[];
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=queue.get(m.id);queue.delete(m.id);m.error?p?.reject(m.error):p?.resolve(m.result);}else events.get(m.method)?.(m.params);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const callId=++id;const timeout=setTimeout(()=>{queue.delete(callId);reject(Error('DevTools timeout: '+method));},15000);queue.set(callId,{resolve:r=>{clearTimeout(timeout);resolve(r);},reject:e=>{clearTimeout(timeout);reject(e);}});ws.send(JSON.stringify({id:callId,method,params}));});
  const js=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const wait=async expression=>{for(let i=0;i<80;i++){if(await js(expression))return;await delay(100);}throw Error('Timeout: '+expression);};
  const click=async(selector,touch=false)=>{
    console.log('input',touch?'touch':'mouse',selector);
    await js(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'center'})`);
    await delay(120);
    const r=await js(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    if(touch){const start=send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[r]});await delay(50);await Promise.all([start,send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);}
    else{await send('Input.dispatchMouseEvent',{type:'mousePressed',...r,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...r,button:'left',clickCount:1});}
  };
  const seek=async time=>js(`(()=>{const s=document.querySelector('[data-story-seek]');s.value=${time};s.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  const key=async key=>{const keyCode=key==='Escape'?27:key==='Tab'?9:13;await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:keyCode});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:keyCode});await delay(80);};
  await send('Page.enable');await send('Runtime.enable');events.set('Runtime.exceptionThrown',p=>errors.push(p.exceptionDetails.text));
  const results=[];
  for(const width of (globalThis.process.argv.includes('--audio')?[]:globalThis.process.argv.includes('--mobile')?[390]:[1440,390,320])){
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<700});
    await send('Emulation.setTouchEmulationEnabled',{enabled:width<700});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:width===320?'reduce':'no-preference'}]});
    await send('Page.navigate',{url:'http://127.0.0.1:4174/'});await wait(`!!document.querySelector('.watch-story:not([hidden])')`);await delay(500);
    await click('.watch-story',width<700);await wait(`document.querySelector('.story-player').open`);await wait(`document.querySelector('[data-story-audio]').textContent.includes('non fournie')`);
    assert.equal(await js(`document.querySelector('[data-story-mute]').disabled`),true);
    await click('[data-story-play]',width<700);
    const paused=await js(`+document.querySelector('[data-story-seek]').value`);await delay(200);assert.equal(await js(`+document.querySelector('[data-story-seek]').value`),paused);
    for(const time of [3,15,32,49,56,63,70,78]){
      await seek(time);await delay(600);
      assert.equal(await js(`document.querySelector('.story-player').scrollWidth>innerWidth`),false);
      assert.ok(await js(`document.querySelector('[data-story-caption]').textContent.length>0`));
      if(width!==320){const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(path.join(temp,`${width}-${time}.png`),Buffer.from(shot.data,'base64'));}
    }
    await click('[data-story-cc]',width<700);assert.equal(await js(`document.querySelector('[data-story-caption]').hidden`),true);await click('[data-story-cc]',width<700);
    await click('[data-story-chapters] button:nth-child(3)',width<700);assert.equal(await js(`document.querySelector('[data-story-scene]').dataset.scene`),'experience');
    await click('.story-player .story-node:nth-of-type(3)',width<700);assert.ok(await js(`document.querySelector('.story-player .story-node-detail').textContent.includes('personnelles')`));
    await click('[data-story-language]',width<700);await wait(`document.documentElement.lang==='en'`);assert.ok(await js(`document.querySelector('[data-story-caption]').textContent.includes('Attijariwafa')`));
    await click('[data-story-replay]',width<700);assert.ok(await js(`+document.querySelector('[data-story-seek]').value<2`));
    await key('Escape');assert.equal(await js(`document.querySelector('.story-player').open`),false);assert.equal(await js(`document.activeElement.classList.contains('watch-story')`),true);
    if(width<700){await click('.menu-toggle',true);assert.equal(await js(`document.querySelector('.menu-toggle').getAttribute('aria-expanded')`),'true');await key('Escape');assert.equal(await js(`document.querySelector('.menu-toggle').getAttribute('aria-expanded')`),'false');}
    await click('.watch-story',width<700);await click('[data-story-skip]',width<700);assert.equal(await js(`document.querySelector('.story-player').open`),false);
    if(width===320)assert.equal(await js('document.getAnimations().length'),0);
    results.push({width,controls:'pass',overflow:false,reducedMotion:width===320});
  }
  // Supply a test-only silent WAV through network interception to exercise the real media clock.
  if(globalThis.process.argv.includes('--audio')){await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await send('Page.navigate',{url:'http://127.0.0.1:4174/'});await wait(`!!document.querySelector('.watch-story:not([hidden])')`);}
  const samples=85*8000,buffer=Buffer.alloc(44+samples*2);buffer.write('RIFF',0);buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(8000,24);buffer.writeUInt32LE(16000,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(samples*2,40);
  await send('Fetch.enable',{patterns:[{urlPattern:'*public/audio/*'}]});
  events.set('Fetch.requestPaused',async p=>{const range=Object.entries(p.request.headers).find(([k])=>k.toLowerCase()==='range')?.[1];const match=range?.match(/bytes=(\d+)-(\d*)/);const start=match?Number(match[1]):0,end=match&&match[2]?Number(match[2]):buffer.length-1;const body=buffer.subarray(start,end+1);await send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:match?206:200,responseHeaders:[{name:'Content-Type',value:'audio/wav'},{name:'Accept-Ranges',value:'bytes'},{name:'Content-Length',value:String(body.length)},...(match?[{name:'Content-Range',value:`bytes ${start}-${end}/${buffer.length}`}]:[])],body:p.request.method==='HEAD'?'':body.toString('base64')});});
  await click('.watch-story',true);await wait(`!document.querySelector('[data-story-mute]').disabled`);
  assert.equal(await js(`document.querySelector('[data-story-mute]').getAttribute('aria-pressed')`),'false');
  await click('[data-story-mute]',true);assert.equal(await js(`document.querySelector('[data-story-mute]').getAttribute('aria-pressed')`),'true');
  await js(`(()=>{const v=document.querySelector('[data-story-volume]');v.value=.25;v.dispatchEvent(new Event('input'));})()`);
  await seek(54);await wait(`+document.querySelector('[data-story-seek]').value>54`);
  assert.equal(await js('document.querySelector(".story-audio").muted'),false);
  assert.equal(await js('document.querySelector(".story-audio").volume'),.25);
  await seek(84.9);await wait(`!document.querySelector('.story-player').open`);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({results,audio:'actual media clock, opt-in sound, seek, volume and completion passed with test-only silent WAV',errors,screenshots:temp}));
  await send('Browser.close');
}finally{ws?.close();process.kill();}
