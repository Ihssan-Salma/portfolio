import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../story-data.js',import.meta.url),'utf8'),context);
const data=context.window.PORTFOLIO_STORY;
test('five scenes and captions exactly cover the silent/audio timeline',()=>{
  assert.equal(data.scenes.length,5);assert.equal(data.duration,85);
  for(const items of [data.scenes,data.captions]){
    let time=0;for(const item of items){assert.equal(item.start,time);assert.ok(item.end>item.start);time=item.end;}assert.equal(time,85);
  }
  data.captions.forEach(c=>{assert.ok(c.en);assert.ok(c.fr);});
});
test('graph edges resolve to nodes; project assets exist; future writes stay labelled',()=>{
  Object.values(data.graphs).forEach(g=>g.edges.forEach(([a,b])=>{assert.ok(g.nodes[a]);assert.ok(g.nodes[b]);}));
  data.projects.forEach(p=>{assert.ok(data.graphs[p.graph]);assert.match(p.repo,/^https:\/\/github.com\//);for(const asset of [p.video,p.image].filter(Boolean))assert.ok(fs.existsSync(new URL('../'+asset,import.meta.url)));});
  assert.equal(data.graphs.reslot.nodes[0].state,'planned');assert.equal(data.graphs.reslot.nodes[5].state,'planned');
});
