import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateLogic, validateWorld } from '../src/content/validate';
import { AdventureEngine } from '../src/core/engine';
import { ContextActions } from '../src/core/actions';
import { ActOneWorld } from '../src/core/world';
import { ActOne, Adventure, prologWorld } from '../src/core/chapters';
import { createRequire } from 'node:module';
import type { ChapterLogic } from '../src/core/types';
const require = createRequire(import.meta.url),
  reference = require('../../context-actions.js');
test('context action metadata preserves exact reference choices', () => {
  for (const s of [
    Adventure.fresh(),
    {
      ...Adventure.fresh(),
      flags: { hood: true, cupboard: true, toolbox: true, chest: true },
      inventory: ['wrench'],
    },
  ])
    for (const r of Object.values(prologWorld.rooms))
      for (const o of r.objects)
        assert.deepEqual(ContextActions.prolog(s, String(o[0])), reference.prolog(s, o[0]));
  for (const room of Object.keys(ActOneWorld.rooms))
    for (const opened of [false, true]) {
      const state = ActOne.fresh();
      state.room = room;
      for (const flag of Object.values(ActOne.doorFlags)) state.flags[flag] = opened;
      state.flags.drawerOpen = state.flags.cleaningLightOn = state.flags.brochureTaken = opened;
      for (const o of ActOneWorld.rooms[room].objects)
        if (
          [
            'wheyPowder',
            'creatineCapsules',
            'insulationTape',
            'shaker',
            'locker',
            'trainingVest',
            'emsConsole',
            'vince',
          ].includes(String(o[0]))
        )
          continue;
        else
          assert.deepEqual(
            ContextActions.act1(state, String(o[0])),
            reference.act1(state, o[0], ActOneWorld),
          );
    }
});
test('content rejects broken rooms, unknown instructions and unsafe keys', () => {
  const world = structuredClone(prologWorld);
  world.connections.yard[0].to = 'missing';
  assert.throws(() => validateWorld(world), /Broken connection/);
  const logic = {
    constants: {},
    programs: {
      act: { parameters: [], commands: [{ kind: 'return', value: { op: 'eval', args: [] } }] },
    },
  } as unknown as ChapterLogic;
  assert.throws(() => validateLogic(logic), /Unknown operation/);
  logic.programs.act.commands = [{ kind: 'return', value: { ref: ['__proto__'] } }];
  assert.throws(() => validateLogic(logic), /Invalid reference/);
  logic.programs.act.commands = [{ kind: 'return', value: { op: 'call:act', args: [] } }];
  assert.throws(() => new AdventureEngine(logic).run('act', []), /depth/);
});
