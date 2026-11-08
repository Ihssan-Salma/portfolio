import test from 'node:test';
import assert from 'node:assert/strict';
import {egradingStages as stages,egradingScenes as scenes,egradingStarts as starts,egradingDuration as duration,egradingSceneAt as sceneAt} from '../reslot-react/src/egrading-scenario.ts';

test('eGrading: timeline, transitions and permission boundary',()=>{
 assert.equal(scenes[0].duration,3);
 assert.ok(duration>=55&&duration<=75);
 assert.equal(starts.at(-1)+scenes.at(-1).duration,duration);
 const ids=new Set(stages.map(stage=>stage.id));
 assert.equal(ids.size,11);
 scenes.forEach((scene,index)=>{assert.equal(sceneAt(starts[index]),index);if(scene.node)assert.ok(ids.has(scene.node));if(scene.from)assert.ok(ids.has(scene.from));});
 const denied=scenes.find(scene=>scene.issue);
 assert.equal(denied.node,'denied');
 assert.match(denied.output,/403.*aucune note ni copie/);
 assert.equal(scenes.at(-1).node,'results');
 assert.equal(sceneAt(duration),scenes.length-1);
 assert.ok(scenes.findIndex(scene=>scene.node==='submission')<scenes.findIndex(scene=>scene.node==='grading'));
});
