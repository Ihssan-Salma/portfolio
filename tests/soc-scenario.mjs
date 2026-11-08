import test from 'node:test';
import assert from 'node:assert/strict';
import { socBeats, socDuration, socStarts, socNodes, socEdges, decisions } from '../reslot-react/src/soc-scenario.ts';

test('SOC: intro, durée, preuves et décision finale', () => {
  assert.equal(socBeats[0].duration, 3);
  assert.equal(socDuration, 64);
  assert.equal(socStarts.at(-1) + socBeats.at(-1).duration, socDuration);
  assert.equal(socBeats.at(-1).node, 'review');
  assert.equal(Object.keys(decisions).length, 3);
  assert.ok(socBeats.some(beat => beat.node === 'alternative'));
  const ids = new Set(socNodes.map(node => node.id));
  for (const edge of socEdges) {
    assert.ok(ids.has(edge.source));
    assert.ok(ids.has(edge.target));
  }
});
