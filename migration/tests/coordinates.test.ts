import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  screenToWorld,
  worldToPixel,
  worldToPercentX,
  worldToPercentY,
  followCamera,
} from '../src/core/coordinates';
test('screen, world and Phaser coordinates share a camera origin at every viewport size', () => {
  for (const [width, height] of [
    [667, 375],
    [844, 390],
    [932, 430],
    [1180, 820],
    [1440, 900],
  ]) {
    const rect = { left: 7, top: 13, width, height };
    assert.deepEqual(screenToWorld(7 + width / 2, 13 + height / 2, rect, 300), { x: 780, y: 270 });
  }
  assert.equal(worldToPixel(960), 640);
  assert.equal(worldToPercentX(780, 300), 50);
  assert.equal(worldToPercentY(270), 50);
  assert.equal(followCamera(900, 1920), 420);
  assert.equal(followCamera(1800, 1920), 960);
});
