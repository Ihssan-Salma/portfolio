import test from 'node:test';
import assert from 'node:assert/strict';
import {fictionalCustomer,rawComplaint,maskedComplaint,prepareModelPayload,sampleExtraction,validateExtraction,calculatePriority,bankingStages as stages,bankingScenes as scenes,bankingStarts as starts,bankingDuration as duration} from '../reslot-react/src/banking-scenario.ts';

test('Banking privacy boundary and API / worker order',()=>{
 assert.equal(duration,68);assert.equal(scenes[0].duration,3);
 assert.equal(starts.at(-1)+scenes.at(-1).duration,duration);
 const ids=new Set(stages.map(stage=>stage.id));assert.equal(ids.size,13);
 scenes.forEach(scene=>{if(scene.node)assert.ok(ids.has(scene.node));if(scene.from)assert.ok(ids.has(scene.from));});
 assert.ok(scenes.findIndex(scene=>scene.node==='queue')<scenes.findIndex(scene=>scene.node==='privacy'));
 const masked=scenes.findIndex(scene=>scene.node==='privacy');
 for(const node of ['graph','retrieval','llama'])assert.ok(masked<scenes.findIndex(scene=>scene.node===node));
 const payload=JSON.stringify(prepareModelPayload(rawComplaint));
 assert.ok(payload.includes('[PERSONNE_01]')&&payload.includes('[COMPTE_01]'));
 assert.ok(!payload.includes(fictionalCustomer.name)&&!payload.includes(fictionalCustomer.account));
 assert.equal(prepareModelPayload(rawComplaint).complaint,maskedComplaint);
 assert.ok(scenes.findIndex(scene=>scene.node==='record')<scenes.findLastIndex(scene=>scene.node==='queue'),'worker acknowledgement follows persistence');
 assert.equal(scenes.at(-1).state,'partial','review remains pending');
});
test('Banking structured extraction and deterministic priority ignore model authority',()=>{
 assert.equal(validateExtraction(sampleExtraction),true);
 assert.equal(validateExtraction({...sampleExtraction,blockingRequested:'oui'}),false);
 assert.throws(()=>calculatePriority({...sampleExtraction,blockingRequested:'oui'}));
 assert.equal(calculatePriority(sampleExtraction).priority,'P1');
 assert.equal(calculatePriority(sampleExtraction).urgent,true);
 assert.equal(calculatePriority({...sampleExtraction,blockingRequested:false,priority:'P1'}).priority,'P2');
 assert.equal(calculatePriority({...sampleExtraction,unauthorizedOperation:false}).urgent,false);
 assert.equal(calculatePriority({...sampleExtraction,blockingRequested:false,dissatisfactionExpressed:false}).priority,'P3');
});
