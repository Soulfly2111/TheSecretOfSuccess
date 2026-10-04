import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { Movement } from '../src/core/movement';
import { ActOneWorld } from '../src/core/world';
const require = createRequire(import.meta.url),
  old = require('../../movement.js'),
  oldWorld = require('../../act1-world.js');
oldWorld.install(old);
ActOneWorld.install(Movement);
test('TypeScript navigation and actor movement preserve original paths', () => {
  for (const [room, m] of Object.entries(Movement.maps))
    for (const point of [
      { x: m.spawn[0], y: m.spawn[1] },
      ...Object.values(m.spots).map((p) => ({ x: Number(p[0]), y: Number(p[1]) })),
    ]) {
      const from = { x: m.spawn[0], y: m.spawn[1] };
      assert.deepEqual(Movement.path(room, from, point), old.path(room, from, point));
      const a = Movement.create(room),
        b = old.create(room);
      Movement.move(a, room, point);
      old.move(b, room, point);
      for (let t = 0; t < 30000 && a.moving; t += 50) {
        Movement.tick(a, 50, room);
        old.tick(b, 50, room);
        assert.equal(a.x, b.x);
        assert.equal(a.y, b.y);
        assert.equal(a.direction, b.direction);
      }
      assert.equal(a.moving, false);
    }
});
