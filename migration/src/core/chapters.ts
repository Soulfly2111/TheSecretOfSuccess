import { AdventureEngine } from './engine';
import type { ChapterLogic, GameState, Value, World } from './types';
import prologLogic from '../content/prolog-logic.json';
import act1Logic from '../content/act1-logic.json';
import itemData from '../content/items.json';
import prologData from '../content/prolog-world.json';
import act1Data from '../content/act1-world.json';
export const prologWorld = prologData as unknown as World,
  act1World = act1Data as unknown as World;
const prologEngine = new AdventureEngine(prologLogic as unknown as ChapterLogic),
  act1Engine = new AdventureEngine(act1Logic as unknown as ChapterLogic);
const value = (state: GameState) => state as unknown as Value;
export const Adventure = {
  items: itemData.prolog as Record<string, string>,
  fresh: (): GameState => ({ room: 'yard', inventory: [], flags: {}, journal: [], won: false }),
  act: (state: GameState, verb: string, target: string, selected?: string | null) =>
    String(prologEngine.run('act', [value(state), verb, target, selected ?? null])),
  hint: (state: GameState) => String(prologEngine.run('hint', [value(state)])),
};
const photoFlags = [
  'photoAsked',
  'selfieTaken',
  'marbleTaken',
  'selfieUploaded',
  'marbleUploaded',
  'photoSent',
  'printPending',
  'badgeIssued',
];
const questFlags = [
  'cleaningLightOn',
  'introDone',
  'walterAsked',
  'wcClue',
  'cardSeen',
  'drawerOpen',
  'knifeTaken',
  'cardTaken',
  'cardReturned',
];
const doorFlags = act1Logic.constants.doorFlags as Record<string, string>;
const run = (name: string, state: GameState, args: Value[] = []) =>
  act1Engine.run(name, [value(state), ...args]);
export interface DialogueLine {
  speaker: string;
  text: string;
}
export const Photo = {
  items: {
    smartphone: itemData.act1.smartphone,
    selfie: itemData.act1.selfie,
    marble: itemData.act1.marble,
    vipBadge: itemData.act1.vipBadge,
  },
  flags: photoFlags,
  act: (s: GameState, v: string, t: string, i?: string | null) =>
    run('photo.act', s, [v, t, i ?? null]) as string | null,
  ready: (s: GameState) => Boolean(run('photo.ready', s)),
  status: (s: GameState) => String(run('photo.status', s)),
  journal: (s: GameState) => run('photo.journal', s),
  issue: (s: GameState) => run('photo.issue', s),
  hint: (s: GameState) => String(run('photo.hint', s)),
  reception: (s: GameState) => run('photo.reception', s) as unknown as DialogueLine[],
};
function normalized(source: unknown): Partial<GameState> | null {
  if (!source || typeof source !== 'object') return null;
  const s = source as Partial<GameState>;
  return {
    room: typeof s.room === 'string' ? s.room : undefined,
    won: s.won === true,
    inventory: Array.isArray(s.inventory)
      ? s.inventory.filter((x): x is string => typeof x === 'string')
      : [],
    flags:
      s.flags && typeof s.flags === 'object'
        ? Object.fromEntries(Object.entries(s.flags).map(([k, v]) => [k, v === true]))
        : {},
    journal: [],
  };
}
export function restoreAct1(
  saved: unknown,
  legacy: unknown,
  validRooms = Object.keys(act1World.rooms),
): GameState {
  const state: GameState = {
      version: 4,
      room: 'lobby',
      inventory: ['smartphone'],
      flags: {},
      journal: [],
    },
    source = normalized(saved ?? legacy);
  if (!source) return state;
  const room = ['lodge', 'vestibule'].includes(source.room ?? '') ? 'lobby' : source.room;
  state.room = !source.won && room && validRooms.includes(room) ? room : 'lobby';
  if (source.inventory?.includes('brochure') || source.flags?.brochureTaken) {
    state.inventory.push('brochure');
    state.flags.brochureTaken = true;
    state.journal.push(
      'Firmenbroschüre aus der Vitrine: Black Hole Investments & Property Management.',
    );
  }
  if (saved) {
    for (const f of [...Object.values(doorFlags), ...questFlags, ...photoFlags])
      state.flags[f] = source.flags?.[f] === true;
    for (const item of ['knife', 'keycard', 'selfie', 'marble', 'vipBadge'])
      if (source.inventory?.includes(item)) state.inventory.push(item);
    const pairs = [
      ['knife', 'knifeTaken'],
      ['keycard', 'cardTaken'],
      ['selfie', 'selfieTaken'],
      ['marble', 'marbleTaken'],
      ['vipBadge', 'badgeIssued'],
    ];
    for (const [item, flag] of pairs) {
      if (state.inventory.includes(item)) state.flags[flag] = true;
      if (state.flags[flag] && !state.inventory.includes(item)) state.inventory.push(item);
    }
    if (state.flags.cardTaken) state.flags.cardSeen = true;
    if (state.flags.cardReturned) state.inventory = state.inventory.filter((x) => x !== 'keycard');
    if (state.flags.badgeIssued) state.flags.printPending = false;
    for (const [flag, text] of [
      ['walterAsked', 'Walter sucht seine Schlüsselkarte. Ich helfe ihm.'],
      ['wcClue', 'Walter hat die Karte zuletzt auf der Fensterbank im WC gesehen.'],
      [
        'cardSeen',
        'Die Schlüsselkarte steckt hinter der Heizung. Der Spalt ist zu eng für meine Hand.',
      ],
      [
        'cardReturned',
        'Walter empfiehlt mich beim Teamleiter. Ein erster Schritt zum Büroplatz im 1. OG.',
      ],
    ])
      if (state.flags[flag]) state.journal.push(text);
  }
  Photo.journal(state);
  return state;
}
export const ActOne = {
  items: itemData.act1 as Record<string, string>,
  Photo,
  doorFlags,
  saveKey: 'success-migration-v1-act1',
  legacyKey: 'success-act1-v1',
  fresh: () => restoreAct1(null, null),
  restore: restoreAct1,
  act: (s: GameState, v: string, t: string, i?: string | null) =>
    String(run('act', s, [v, t, i ?? null])),
  hint: (s: GameState) => String(run('hint', s)),
  visible: (s: GameState, id: string) => Boolean(run('visible', s, [id])),
  dialogue: (s: GameState, topic: string) =>
    run('dialogue', s, [topic]) as unknown as DialogueLine[],
  options: (s: GameState) => run('options', s),
  canEnter: () => '',
  walkExit: (s: GameState, id: string) =>
    ['stairs', 'stairsUp', 'elevator', 'lobbyExit', 'upperExit', 'secondExit'].includes(id) ||
    !!s.flags[doorFlags[id]],
};
export function restoreProlog(source: unknown): GameState {
  const s = normalized(source),
    state = Adventure.fresh();
  if (!s || !s.room || !prologWorld.rooms[s.room]) return state;
  return {
    ...state,
    room: s.room,
    inventory: (s.inventory ?? []).filter((x) => x in Adventure.items),
    flags: s.flags ?? {},
    won: !!s.won,
  };
}
