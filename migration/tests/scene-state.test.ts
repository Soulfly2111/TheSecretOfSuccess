import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { SceneState } from '../src/core/scene-state';
import { Adventure } from '../src/core/chapters';
const require = createRequire(import.meta.url),
  reference = require('../../scene-state.js');
test('JSON scene visibility preserves removed items and opened objects', () => {
  const flags = [
    'cupboard',
    'coffeeGiven',
    'grounds',
    'brewed',
    'toolbox',
    'chest',
    'hood',
    'beltTaken',
    'belt',
  ];
  for (let mask = 0; mask < 1 << flags.length; mask++)
    for (const inventory of [
      [],
      ['cup'],
      ['water'],
      ['coffee'],
      ['manual', 'key', 'rag', 'grounds', 'wrench'],
    ]) {
      const s = Adventure.fresh();
      s.inventory = inventory;
      s.flags = Object.fromEntries(flags.map((name, i) => [name, !!(mask & (1 << i))]));
      assert.deepEqual(SceneState.objects(s), reference.objects(s));
    }
});
