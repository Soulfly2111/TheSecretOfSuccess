import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { Adventure, ActOne, restoreProlog, restoreAct1 } from '../src/core/chapters';
import { encode, decode } from '../src/core/save';
import type { GameState } from '../src/core/types';
const require = createRequire(import.meta.url),
  oldP = require('../../engine.js'),
  oldA = require('../../act1-engine.js');
const verbs = [
  'Öffne',
  'Schließe',
  'Drücke',
  'Ziehe',
  'Gehe zu',
  'Nimm',
  'Rede mit',
  'Gib',
  'Benutze',
  'Schau an',
  'Mach an',
  'Mach aus',
];
test('JSON prolog rules preserve reference actions and hints', () => {
  for (const flags of [
    {},
    {
      read: true,
      hood: true,
      coffeeGiven: true,
      water: true,
      grounds: true,
      brewed: true,
      toolbox: true,
    },
    { read: true, tight: true, belt: true, beltTaken: true, coffeeGiven: true },
  ])
    for (const target of [
      'manual',
      'key',
      'cup',
      'grounds',
      'car',
      'tractor',
      'mechanic',
      'hay',
      'toolbox',
      'chest',
      'cupboard',
      'stove',
      'pot',
      'well',
      'rag',
      'dirtybelt',
    ])
      for (const verb of verbs)
        for (const selected of [null, ...Object.keys(oldP.items)]) {
          const s: GameState = {
              room: 'yard',
              inventory: Object.keys(oldP.items),
              flags: { ...flags } as Record<string, boolean>,
              journal: [],
              won: false,
            },
            a = structuredClone(s),
            b = structuredClone(s);
          assert.equal(
            Adventure.act(a, verb, target, selected),
            oldP.act(b, verb, target, selected),
            `${verb} ${selected} ${target}`,
          );
          assert.deepEqual(a, b);
          assert.equal(Adventure.hint(a), oldP.hint(b));
        }
});
test('JSON Act 1 preserves actions, dialogue, photo and hints', () => {
  for (const room of ['lobby', 'restroom', 'corridor', 'kitchen', 'upper'])
    for (const flags of [
      {},
      { cardSeen: true, drawerOpen: true, knifeTaken: true },
      { cleaningLightOn: true, selfieTaken: true, marbleTaken: true, photoAsked: true },
      {
        selfieUploaded: true,
        marbleUploaded: true,
        photoSent: true,
        cardReturned: true,
        badgeIssued: true,
      },
    ])
      for (const target of [
        'walter',
        'reception',
        'radiator',
        'keycard',
        'drawer',
        'knife',
        'brochureStand',
        'brochure',
        'hero',
        'graphicsPC',
        'badgePrinter',
        'lightSwitch',
        'wc',
        'phone',
      ])
        for (const verb of verbs)
          for (const item of [null, 'smartphone', 'knife', 'keycard', 'brochure']) {
            const s: GameState = {
                room,
                inventory: Object.keys(oldA.items),
                flags: { ...flags } as Record<string, boolean>,
                journal: [],
              },
              a = structuredClone(s),
              b = structuredClone(s);
            assert.equal(
              ActOne.act(a, verb, target, item),
              oldA.act(b, verb, target, item),
              `${room} ${verb} ${item} ${target}`,
            );
            assert.deepEqual(a, b);
            const referenceHint = oldA.hint(b);
            if (
              referenceHint === 'Benutze dein Smartphone mit dem freien Grafik-PC in der 1. Etage.'
            )
              assert.equal(
                ActOne.hint(a),
                'Lade Selfie und Marmor-Datei am Grafik-PC einzeln hoch oder benutze dort das Smartphone für beide Dateien.',
              );
            else assert.equal(ActOne.hint(a), referenceHint);
          }
  for (const topic of ['thanks', 'walter', 'lastSeen']) {
    const a = ActOne.fresh(),
      b = oldA.fresh();
    assert.deepEqual(ActOne.dialogue(a, topic), oldA.dialogue(b, topic));
    assert.deepEqual(a.flags, b.flags);
    assert.deepEqual(a.journal, b.journal);
  }
});
test('versioned saves import old progress without changing source', () => {
  const old = {
      room: 'corridor',
      inventory: ['brochure', 'knife', 'keycard'],
      flags: { introDone: true, cardSeen: true, cleaningLightOn: true, technicalOpen: true },
    },
    before = JSON.stringify(old),
    s = restoreAct1(old, null);
  assert.equal(JSON.stringify(old), before);
  assert(s.flags.cleaningLightOn);
  assert(s.inventory.includes('smartphone'));
  assert.deepEqual(decode(encode('act1', s), 'act1'), s);
  assert.equal(decode(encode('act1', s), 'prolog'), null);
  const p = restoreProlog({ room: 'house', inventory: ['key'], flags: { read: true } });
  assert(p.flags.read);
  assert.equal(p.room, 'house');
  assert.equal(restoreAct1({ ...old, won: true }, null).room, 'lobby');
});

test('photo files upload individually or together without duplicates', () => {
  const state = ActOne.fresh();
  state.inventory.push('selfie', 'marble');
  state.flags.selfieTaken = true;
  state.flags.marbleTaken = true;

  assert.match(ActOne.act(state, 'Benutze', 'graphicsPC', 'marble'), /Selfie/);
  assert.equal(state.flags.marbleUploaded, true);
  assert.equal(state.flags.selfieUploaded, false);
  assert.match(ActOne.act(state, 'Benutze', 'graphicsPC', 'selfie'), /MacroPhotoshop/);
  assert.equal(state.flags.selfieUploaded, true);
  assert.equal(state.flags.photoSent, true);
  assert.equal(state.inventory.filter((item) => item === 'selfie').length, 1);
  assert.equal(state.inventory.filter((item) => item === 'marble').length, 1);

  const bulk = ActOne.fresh();
  bulk.inventory.push('selfie', 'marble');
  bulk.flags.selfieTaken = true;
  bulk.flags.marbleTaken = true;
  assert.match(ActOne.act(bulk, 'Benutze', 'graphicsPC', 'smartphone'), /MacroPhotoshop/);
  assert.equal(bulk.flags.selfieUploaded, true);
  assert.equal(bulk.flags.marbleUploaded, true);
  assert.equal(bulk.flags.photoSent, true);
  const snapshot = structuredClone(bulk);
  ActOne.act(bulk, 'Benutze', 'graphicsPC', 'smartphone');
  assert.deepEqual(bulk, snapshot);
});

test('Vince quest grants the team leader recommendation only after the influencer mode', () => {
  const s = ActOne.fresh();
  s.flags.introDone = true;
  ActOne.Vince.talk(s, 'teamLeader');
  ActOne.Vince.talk(s, 'vince');
  assert.match(ActOne.act(s, 'Öffne', 'locker'), /Spind öffnet/);
  assert.match(ActOne.act(s, 'Nimm', 'wheyPowder'), /eingesteckt/);
  assert.match(ActOne.act(s, 'Nimm', 'creatineCapsules'), /eingesteckt/);
  assert.match(ActOne.act(s, 'Benutze', 'coffeeMachine'), /Konzernkaffee/);
  assert.match(ActOne.act(s, 'Benutze', 'shaker', 'coffee'), /Vincepiration-Shake/);
  assert.match(ActOne.act(s, 'Gib', 'vince', 'muscleShake'), /Reichweite/);
  ActOne.act(s, 'Schau an', 'trainingVest');
  ActOne.act(s, 'Nimm', 'insulationTape');
  assert.match(ActOne.act(s, 'Benutze', 'trainingVest', 'insulationTape'), /INFLUENCER-MODUS/);
  assert.match(ActOne.act(s, 'Benutze', 'emsConsole'), /INFLUENCER-MODUS/);
  assert(s.flags.vinceTransformed);
  assert(s.inventory.includes('officeRelease3F'));
  ActOne.Vince.talk(s, 'teamLeader');
  assert(s.flags.teamLeaderRecommendation);
});
