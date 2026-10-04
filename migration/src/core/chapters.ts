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
  'teamLeaderQuestStarted',
  'vinceDreamKnown',
  'vinceLockerCodeKnown',
  'lockerOpen',
  'wheyTaken',
  'creatineTaken',
  'coffeePrepared',
  'shakeMixed',
  'vinceDrankShake',
  'vestInspected',
  'tapeTaken',
  'vestModified',
  'vinceTransformed',
  'thirdFloorOfficeReleased',
  'teamLeaderRecommendation',
  'workstationAssigned',
  'workstationComplete',
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
const vinceItems = [
  'wheyPowder',
  'creatineCapsules',
  'coffee',
  'muscleShake',
  'insulationTape',
  'officeRelease3F',
];
const has = (s: GameState, id: string) => s.inventory.includes(id);
const add = (s: GameState, id: string) => {
  if (!has(s, id)) s.inventory.push(id);
};
const remove = (s: GameState, id: string) => {
  s.inventory = s.inventory.filter((entry) => entry !== id);
};
function note(s: GameState, text: string) {
  if (!s.journal.includes(text)) s.journal.push(text);
}
const vinceAct = (
  s: GameState,
  verb: string,
  target: string,
  item?: string | null,
): string | null => {
  const f = s.flags;
  if (target === 'wheyPowder' && verb === 'Nimm') {
    if (f.wheyTaken)
      return 'Die Dose ist schon im Inventar. Sie klingt beim Schütteln wie ein kleines Quartalsziel.';
    f.wheyTaken = true;
    add(s, 'wheyPowder');
    note(s, 'Für Vince fehlt noch Creatin und ein Kaffee als Aktivator.');
    return 'Executive Bulk Vanilla eingesteckt. Die Portionsgröße lautet: strategisch überambitioniert.';
  }
  if (target === 'coffeeMachine' && ['Benutze', 'Mach an'].includes(verb)) {
    if (f.coffeePrepared)
      return 'Der Konzernkaffee ist bereits bereit. Er wirkt, als hätte er eigene Ziele.';
    f.coffeePrepared = true;
    add(s, 'coffee');
    return 'Konzernkaffee gezapft. Er riecht nach Aufbruch und einer sehr langen Sitzung.';
  }
  if (target === 'locker' && verb === 'Öffne') {
    if (!f.vinceLockerCodeKnown)
      return 'Der Spind verlangt einen Code. Vince schaut, als hätte er für Zahlen ein Muskelgedächtnis.';
    f.lockerOpen = true;
    return '030G. Der Spind öffnet sich. Vince hat seinen Karrieretraum offenbar auch als PIN gespeichert.';
  }
  if (target === 'locker' && verb === 'Schließe') {
    f.lockerOpen = false;
    return 'Der Spind ist wieder geschlossen. Vinces Karrieregeheimnisse sind sicher.';
  }
  if (target === 'creatineCapsules' && verb === 'Schau an')
    return 'Creatin-Kapseln. Auf dem Etikett steht: Für Mitarbeiter mit Wachstumsambitionen.';
  if (target === 'creatineCapsules' && verb === 'Nimm') {
    if (!f.lockerOpen) return 'Die Kapseln stehen hinter der verschlossenen Spindtür.';
    if (f.creatineTaken) return 'Die Creatin-Kapseln sind bereits eingesteckt.';
    f.creatineTaken = true;
    add(s, 'creatineCapsules');
    return 'Creatin-Kapseln eingesteckt. Der Beipackzettel hat mehr Seiten als mein Arbeitsvertrag.';
  }
  if (target === 'insulationTape' && verb === 'Nimm') {
    if (f.tapeTaken) return 'Das Isolierband steckt bereits im Inventar.';
    f.tapeTaken = true;
    add(s, 'insulationTape');
    return 'Isolierband genommen. Es klebt besser als manche Karriereversprechen.';
  }
  if (target === 'trainingVest' && verb === 'Schau an') {
    f.vestInspected = true;
    note(
      s,
      'An Vinces Trainingsweste hängt ein loses Kabel. Isolierband könnte den Influencer-Modus freischalten.',
    );
    return 'Eine Trainingsweste mit einem losen Kabel. Das sieht nach einer sehr schlechten Idee mit gutem Timing aus.';
  }
  if (target === 'trainingVest' && item === 'insulationTape' && ['Benutze', 'Gib'].includes(verb)) {
    if (!f.vestInspected) return 'Ich sollte die Weste zuerst genauer ansehen.';
    f.vestModified = true;
    return 'Das lose Kabel ist mit Isolierband gesichert. Auf der Konsole blinkt jetzt: INFLUENCER-MODUS.';
  }
  if (target === 'shaker' && ['Benutze', 'Gib'].includes(verb)) {
    if (!['wheyPowder', 'creatineCapsules', 'coffee'].includes(item ?? ''))
      return 'Der Shaker wartet auf Zutaten mit zweifelhafter sportlicher Ambition.';
    if (!has(s, 'wheyPowder') || !has(s, 'creatineCapsules') || !has(s, 'coffee'))
      return 'Für den Shake fehlen noch Executive Bulk Vanilla, Creatin-Kapseln oder Konzernkaffee.';
    if (f.shakeMixed)
      return 'Der Vincepiration-Shake ist bereits fertig. Das Getränk hat mehr Ehrgeiz als Farbe.';
    for (const id of ['wheyPowder', 'creatineCapsules', 'coffee']) remove(s, id);
    f.shakeMixed = true;
    add(s, 'muscleShake');
    note(
      s,
      'Der Vincepiration-Shake ist fertig. Vince wartet im EMS-Raum auf seinen großen Auftritt.',
    );
    return 'Vincepiration-Shake gemischt. Das Getränk hat mehr Ehrgeiz als Farbe.';
  }
  if (target === 'vince' && item === 'muscleShake' && ['Benutze', 'Gib'].includes(verb)) {
    if (!f.vinceDreamKnown)
      return 'Vince nimmt keine Getränke von Fremden. Erst muss ich wissen, wofür er trainiert.';
    f.vinceDrankShake = true;
    remove(s, 'muscleShake');
    note(
      s,
      'Vince hat den Shake getrunken und will jetzt „Content“. Die Weste muss noch den Influencer-Modus bekommen.',
    );
    return 'Vince kippt den Shake herunter. „Das schmeckt nach Reichweite.“';
  }
  if (target === 'emsConsole' && ['Benutze', 'Mach an'].includes(verb)) {
    if (!f.vinceDrankShake || !f.vestModified)
      return !f.vinceDrankShake
        ? 'Die Konsole ist bereit. Vince fehlt nur noch sein völlig überzogenes Getränk.'
        : 'Die Konsole meldet: Trainingsweste nicht für Influencer-Modus vorbereitet.';
    if (f.vinceTransformed)
      return 'INFLUENCER-MODUS abgeschlossen. Die Konsole empfiehlt eine ruhige Selbstreflexion.';
    f.vinceTransformed = true;
    f.thirdFloorOfficeReleased = true;
    add(s, 'officeRelease3F');
    note(
      s,
      'Vince gibt seinen Büroplatz im 3. OG frei. Damit kann der Teamleiter endlich näher bei seinem Team sitzen.',
    );
    return 'INFLUENCER-MODUS gestartet. WARNUNG: Diese Einstellung wurde vom Betriebsrat nur für Metaphern freigegeben.';
  }
  return null;
};
const vinceTalk = (s: GameState, target: string): DialogueLine[] | null => {
  const f = s.flags;
  if (target === 'teamLeader') {
    if (!f.teamLeaderQuestStarted) {
      f.teamLeaderQuestStarted = true;
      note(s, 'Der Teamleiter hilft mir nur, wenn er einen Büroplatz im 3. OG bekommt.');
      return [
        {
          speaker: 'teamLeader',
          text: 'Noch ein neuer Mitarbeiter? Ich sitze im 2. OG zwischen Kopierer und Muskelstrom, während mein Team im 3. OG sitzt.',
        },
        {
          speaker: 'teamLeader',
          text: 'Ich bin Teamleiter ohne Teamgeruch. Besorg mir den freien Platz von Vince, dann reden wir über deinen Büroplatz.',
        },
      ];
    }
    if (f.thirdFloorOfficeReleased && !f.teamLeaderRecommendation) {
      f.teamLeaderRecommendation = true;
      f.workstationAssigned = true;
      note(
        s,
        'Der Teamleiter unterstützt meine Einstellung. Mein Büroplatz am Grafik-Arbeitsplatz im 1. OG ist zugesagt.',
      );
      return [
        { speaker: 'hero', text: 'Vince gibt sein Büro im 3. OG auf.' },
        { speaker: 'teamLeader', text: 'Freiwillig?' },
        { speaker: 'hero', text: 'Sagen wir: mit stark erhöhtem Selbstbild.' },
        {
          speaker: 'teamLeader',
          text: 'Gut. Dann bekommen Sie Ihren Büroplatz im 1. OG. Ich nenne das Führung durch Delegation.',
        },
      ];
    }
    return [
      {
        speaker: 'teamLeader',
        text: 'Mein Team sitzt im 3. OG. Ich sitze hier. Das ist keine Distanz, das ist ein Führungsproblem.',
      },
    ];
  }
  if (target === 'vince') {
    if (!f.vinceDreamKnown) {
      f.vinceDreamKnown = true;
      f.vinceLockerCodeKnown = true;
      note(s, 'Vince träumt von einer Karriere als Fitness-Influencer. Sein Spind-Code ist 030G.');
      return [
        {
          speaker: 'vince',
          text: 'Ich habe schon einen Kanalnamen: Vincepiration. Noch fehlen mir nur Muskeln, Reichweite und ein Grund, nie wieder in mein Büro zu gehen.',
        },
        {
          speaker: 'vince',
          text: 'Mein Spind-Code ist 030G. Ich benutze ihn überall. Das 3. OG ist schließlich mein Ziel.',
        },
      ];
    }
    if (f.vinceTransformed)
      return [
        {
          speaker: 'vince',
          text: 'Mein Büro im 3. OG ist zu klein für diese Marke. Der Teamleiter kann es haben. Ich brauche Licht, Spiegel und eine Wand für meinen Hashtag.',
        },
      ];
    return [
      {
        speaker: 'vince',
        text: f.vinceDrankShake
          ? 'Ich spüre schon den Content. Jetzt fehlt nur noch ein Impuls mit tragfähiger Außenwirkung.'
          : 'Vincepiration wartet auf den ersten großen Push.',
      },
    ];
  }
  if (target === 'trainer')
    return [
      {
        speaker: 'trainer',
        text: 'Die Weste hat drei Stufen: Büro, Sport und warum riecht es nach Garantieverlust?',
      },
    ];
  return null;
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
    for (const item of ['knife', 'keycard', 'selfie', 'marble', 'vipBadge', ...vinceItems])
      if (source.inventory?.includes(item)) state.inventory.push(item);
    const pairs = [
      ['knife', 'knifeTaken'],
      ['keycard', 'cardTaken'],
      ['selfie', 'selfieTaken'],
      ['marble', 'marbleTaken'],
      ['vipBadge', 'badgeIssued'],
      ['wheyPowder', 'wheyTaken'],
      ['creatineCapsules', 'creatineTaken'],
      ['insulationTape', 'tapeTaken'],
      ['officeRelease3F', 'thirdFloorOfficeReleased'],
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
      [
        'teamLeaderQuestStarted',
        'Der Teamleiter hilft mir nur, wenn er einen Büroplatz im 3. OG bekommt.',
      ],
      [
        'vinceDreamKnown',
        'Vince träumt von einer Karriere als Fitness-Influencer. Sein Spind-Code ist 030G.',
      ],
      ['vinceTransformed', 'Vince gibt seinen Büroplatz im 3. OG frei.'],
      [
        'teamLeaderRecommendation',
        'Der Teamleiter unterstützt meine Einstellung. Büroplatz im 1. OG zugesagt.',
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
    vinceAct(s, v, t, i) ?? String(run('act', s, [v, t, i ?? null])),
  hint: (s: GameState) => {
    if (!s.flags.introDone) return String(run('hint', s));
    if (!s.flags.teamLeaderQuestStarted)
      return 'Sprich nach der Begrüßung mit dem Teamleiter in der 2. Etage.';
    if (!s.flags.vinceDreamKnown)
      return 'Im EMS-Raum trainiert Vince. Er scheint sich selbst sehr ernst zu nehmen.';
    if (!s.flags.shakeMixed)
      return 'Für Vinces Shake brauchst du Whey, Creatin aus seinem Spind und Konzernkaffee.';
    if (!s.flags.vinceDrankShake) return 'Gib Vince den Vincepiration-Shake.';
    if (!s.flags.vestModified)
      return 'Untersuche die Trainingsweste und suche Isolierband im Reinigungsraum.';
    if (!s.flags.vinceTransformed) return 'Schalte den Influencer-Modus an der EMS-Konsole ein.';
    if (!s.flags.teamLeaderRecommendation)
      return 'Mit Vinces Bürofreigabe solltest du zum Teamleiter zurückkehren.';
    return String(run('hint', s));
  },
  visible: (s: GameState, id: string) => {
    if (id === 'wheyPowder') return !s.flags.wheyTaken;
    if (id === 'creatineCapsules') return Boolean(s.flags.lockerOpen && !s.flags.creatineTaken);
    if (id === 'insulationTape') return !s.flags.tapeTaken;
    return Boolean(run('visible', s, [id]));
  },
  Vince: {
    talk: vinceTalk,
    ready: (s: GameState) =>
      Boolean(s.flags.cardReturned && s.flags.badgeIssued && s.flags.teamLeaderRecommendation),
    completeWorkstation: (s: GameState) => {
      if (!s.flags.workstationAssigned) return null;
      if (s.flags.workstationAssigned && !s.flags.workstationComplete) {
        s.flags.workstationComplete = true;
        note(
          s,
          'Arbeitsbeginn bestätigt. Mein Platz im 1. OG ist frei für den nächsten Karriereschritt.',
        );
        return 'Mein Arbeitsplatz im 1. OG. Der erste Tag beginnt – und niemand hat mir bisher eine Aufgabe gegeben. Das ist vermutlich ein Test.';
      }
      return 'Mein Arbeitsplatz wartet geduldig. Vermutlich wurde er dafür ausgebildet.';
    },
  },
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
