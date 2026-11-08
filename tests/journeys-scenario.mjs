import test from 'node:test';
import assert from 'node:assert/strict';
import {createReslotJourney} from '../reslot-react/src/scenario.ts';
import {socJourney} from '../reslot-react/src/soc-scenario.ts';
test('Shared journeys: contextual intro, complete references and expected durations',()=>{
 for(const [scenario,duration] of [[createReslotJourney(),70],[socJourney,67]]){
  assert.equal(scenario.scenes[0].duration,3);
  assert.equal(scenario.scenes[0].node,undefined);
  assert.equal(scenario.scenes.reduce((sum,scene)=>sum+scene.duration,0),duration);
  const ids=new Set(scenario.stages.map(stage=>stage.id));assert.equal(ids.size,11);
  scenario.scenes.forEach(scene=>{if(scene.node)assert.ok(ids.has(scene.node));if(scene.from)assert.ok(ids.has(scene.from));});
 }
});
test('ReSlot retains offer fallback and human approval; SOC retains uncertainty',()=>{
 const declined=createReslotJourney(),expired=createReslotJourney('timeout');
 assert.equal(declined.scenes.length,expired.scenes.length);
 assert.deepEqual(declined.scenes.map(scene=>scene.duration),expired.scenes.map(scene=>scene.duration));
 assert.ok(expired.scenes.some(scene=>/expirée/.test(scene.output)));
 assert.ok(declined.scenes.some(scene=>/Refus reçu/.test(scene.output)));
 const approval=declined.scenes.findIndex(scene=>scene.node==='owner');
 assert.ok(declined.scenes.findIndex(scene=>scene.from==='owner'&&scene.node==='calendar')>approval);
 assert.ok(socJourney.scenes.some(scene=>scene.node==='alternative'));
 assert.equal(socJourney.scenes.at(-1).state,'partial');
 assert.match(socJourney.scenes.at(-1).output,/Aucune réponse automatique/);
});
