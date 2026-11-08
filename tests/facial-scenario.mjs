import test from 'node:test';
import assert from 'node:assert/strict';
import {expressionClasses,exampleScores,weakScores,sequenceScores,smoothedScores,topClass,acceptedClass,facialScenes as scenes,facialStarts as starts,facialDuration as duration,facialStages as stages} from '../reslot-react/src/facial-scenario.ts';

test('Facial pipeline: valid synthetic distributions, abstention and smoothing',()=>{
 assert.equal(expressionClasses.length,7);
 for(const scores of [exampleScores,weakScores,...sequenceScores,...smoothedScores]){
  assert.equal(scores.length,7);
  assert.ok(scores.every(score=>score>=0&&score<=1));
  assert.ok(Math.abs(scores.reduce((sum,score)=>sum+score,0)-1)<1e-9);
 }
 assert.equal(acceptedClass(exampleScores),3);
 assert.equal(acceptedClass(weakScores),null,'weak confidence must abstain');
 assert.deepEqual(sequenceScores.map(topClass),[3,5,3,5,3]);
 assert.deepEqual(smoothedScores.map(topClass),[3,3,3,3,3]);
 assert.ok(smoothedScores.every(scores=>acceptedClass(scores)===3));
 assert.equal(Math.round(smoothedScores.at(-1)[3]*100),59);
});
test('Facial timeline: 3-second context, complete journey, no invented evaluation',()=>{
 assert.equal(scenes[0].duration,3);
 assert.equal(duration,70);
 assert.equal(starts.at(-1)+scenes.at(-1).duration,duration);
 const ids=new Set(stages.map(stage=>stage.id));
 assert.equal(ids.size,9);
 for(const scene of scenes){if(scene.node)assert.ok(ids.has(scene.node));if(scene.from)assert.ok(ids.has(scene.from));}
 assert.equal(scenes.find(scene=>scene.issue).node,'confidence');
 assert.match(scenes.find(scene=>scene.state==='partial').output,/Indéterminé/);
 assert.equal(scenes.at(-1).node,'evaluation');
 for(const scene of scenes.filter(scene=>scene.node==='evaluation'))assert.doesNotMatch(scene.output,/\d+[.,]?\d*\s*%/);
 assert.match(stages.find(stage=>stage.id==='overlay').detail,/pas une lecture fiable/);
});
