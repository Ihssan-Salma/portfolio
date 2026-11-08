import test from 'node:test';
import assert from 'node:assert/strict';
import { beats, nodes, edges, duration, starts, beatAt } from '../reslot-react/src/scenario.ts';

test('ReSlot: 67-second deterministic journey with exactly four agents', () => {
  assert.equal(duration, 67);
  assert.equal(beats[0].duration, 3);
  assert.equal(nodes.filter(n => n.data.agent).length, 4);
  assert.equal(new Set(nodes.map(n => n.id)).size, nodes.length);
  for (const edge of edges) {
    assert.ok(nodes.some(n => n.id === edge.source));
    assert.ok(nodes.some(n => n.id === edge.target));
  }
});
test('ReSlot: retry, approval and canonical update remain ordered', () => {
  const retry = beats.findIndex(b => b.from === 'response' && b.node === 'match');
  const approval = beats.findIndex(b => b.node === 'owner');
  const write = beats.findIndex(b => b.from === 'owner' && b.node === 'calendar');
  assert.ok(retry > 0 && retry < approval && approval < write);
  assert.equal(beats.at(-1).node, 'audit');
  starts.forEach((time, index) => assert.equal(beatAt(time), index));
  assert.equal(beatAt(duration), beats.length - 1);
});
