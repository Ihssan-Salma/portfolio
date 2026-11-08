import test from 'node:test';
import assert from 'node:assert/strict';
import {homeStateAt,iotStages as stages,iotScenes as scenes,iotStarts as starts,iotDuration as duration} from '../reslot-react/src/iot-scenario.ts';
test('IoT: request, device change, acknowledgement then dashboard update',()=>{
 assert.equal(scenes[0].duration,3);
 assert.equal(duration,68);
 assert.equal(starts.at(-1)+scenes.at(-1).duration,duration);
 const ids=new Set(stages.map(stage=>stage.id));
 assert.equal(ids.size,9);
 for(const scene of scenes){if(scene.node)assert.ok(ids.has(scene.node));if(scene.from)assert.ok(ids.has(scene.from));}
 assert.equal(homeStateAt(26).deviceLight,'Éteinte');
 assert.equal(homeStateAt(30).pending,true);
 assert.equal(homeStateAt(38).deviceLight,'Allumée');
 assert.equal(homeStateAt(38).dashboardLight,'Éteinte','no premature dashboard success');
 assert.equal(homeStateAt(40).acknowledged,true);
 assert.equal(homeStateAt(44).dashboardLight,'Allumée');
 assert.equal(homeStateAt(44).pending,false);
});
test('IoT: door notification and denied control preserve confirmed state',()=>{
 assert.equal(homeStateAt(47).door,'Fermée');
 assert.equal(homeStateAt(50).door,'Ouverte');
 assert.equal(homeStateAt(54).notified,true);
 assert.equal(homeStateAt(57).reviewed,false);
 assert.equal(homeStateAt(58).reviewed,true);
 const deniedIndex=scenes.findIndex(scene=>scene.issue);
 assert.equal(scenes[deniedIndex].node,'https');
 assert.ok(scenes.slice(deniedIndex+1).every(scene=>scene.node!=='gateway'&&scene.node!=='light'),'denied command never forwarded to device');
 for(const time of [60,64,68]){
  assert.equal(homeStateAt(time).denied,true);
  assert.equal(homeStateAt(time).dashboardLight,'Allumée');
  assert.equal(homeStateAt(time).deviceLight,'Allumée');
 }
});
