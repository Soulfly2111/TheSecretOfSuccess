import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankHitTargets } from '../src/shell/hit-target';

const hit = (element: string, exact: boolean, zIndex: number, order: number, distance: number) => ({
  element,
  exact,
  zIndex,
  order,
  distance,
});

test('exact visual hits beat enlarged touch areas', () => {
  const ranked = rankHitTargets([
    hit('near-touch-target', false, 99, 99, 1),
    hit('painted-target', true, 1, 1, 40),
  ]);
  assert.deepEqual(
    ranked.map(({ element }) => element),
    ['painted-target'],
  );
});

test('front paint order wins an exact overlap', () => {
  assert.equal(
    rankHitTargets([hit('entrance', true, 2, 0, 3), hit('brochure-display', true, 2, 1, 20)])[0]
      .element,
    'brochure-display',
  );
  assert.equal(
    rankHitTargets([hit('late-dom', true, 2, 9, 1), hit('higher-layer', true, 3, 0, 20)])[0]
      .element,
    'higher-layer',
  );
});

test('nearest center wins when only enlarged touch areas overlap', () => {
  assert.equal(
    rankHitTargets([hit('far-front', false, 5, 5, 19), hit('near-back', false, 1, 1, 4)])[0]
      .element,
    'near-back',
  );
});
