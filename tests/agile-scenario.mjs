import test from 'node:test';
import assert from 'node:assert/strict';
import {agileStages as stages,agileScenes as scenes,agileStarts as starts,agileDuration as duration,agileScenario} from '../reslot-react/src/agile-scenario.ts';

test('Agile Tracker: services, private databases and graceful partial result',()=>{
 assert.equal(scenes[0].duration,3);
 assert.ok(duration>=55&&duration<=75);
 assert.equal(duration,69);
 assert.equal(starts.at(-1)+scenes.at(-1).duration,duration);
 const ids=new Set(stages.map(stage=>stage.id));
 for(const scene of scenes){if(scene.node)assert.ok(ids.has(scene.node));if(scene.from)assert.ok(ids.has(scene.from));}
 const databases=stages.filter(stage=>stage.id.endsWith('-db'));
 assert.equal(databases.length,3);
 assert.equal(new Set(databases.map(stage=>stage.boundary)).size,3);
 for(const database of databases){
  const writes=scenes.filter(scene=>scene.node===database.id);
  assert.ok(writes.length>0);
  for(const write of writes)assert.equal(stages.find(stage=>stage.id===write.from).boundary,database.boundary,'only owning service writes its database');
 }
 assert.match(agileScenario.environment,/Docker Compose/);
 assert.equal(scenes.filter(scene=>scene.issue).length,1);
 assert.equal(scenes.find(scene=>scene.issue).node,'timeout');
 assert.equal(scenes.at(-1).state,'partial');
 assert.match(scenes.at(-1).output,/2 à faire, 1 en cours/);
 assert.match(scenes.find(scene=>scene.node==='dashboard').output,/0\/3 terminées.*90 min.*noms indisponibles/);
 assert.ok(scenes.findIndex(scene=>scene.output.includes('À faire → En cours'))<scenes.findIndex(scene=>scene.output.includes('entrée de temps')));
});
