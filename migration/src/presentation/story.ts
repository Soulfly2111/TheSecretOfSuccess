import { Movement, type Actor } from '../core/movement';
import { ActOne, type DialogueLine } from '../core/chapters';
import type { GameState } from '../core/types';
import { ActOneCast as originalCast } from '../shell/act1-cast';
import { SceneDialogue as originalDialogue } from '../shell/dialogue';
interface Cast {
  actors: Record<string, Actor | null>;
  init: () => void;
  update: (dt: number, s: GameState, hold: boolean) => void;
  setSpeaker: (id: string | null) => void;
  ready: boolean;
}
const cast = originalCast as unknown as Cast;
interface Adapter {
  state: () => GameState;
  hero: () => Actor;
  save: () => void;
  render: () => void;
  say: (text: string) => void;
  ready: () => boolean;
}
interface Topic {
  id: string;
  text: string;
}
const SceneDialogue = originalDialogue as unknown as {
  hide: () => void;
  show: (text: string, options: { speaker: string; blocking: boolean; onDone: () => void }) => void;
  choices: (topics: Topic[], select: (topic: Topic) => void) => void;
};
interface Conversation {
  lines?: DialogueLine[];
  index: number;
  done?: () => void;
  choices?: boolean;
}
interface Intro {
  phase: 'approach' | 'talk' | 'leave' | 'lift';
  elapsed: number;
}
let api: Adapter,
  conversation: Conversation | null = null,
  intro: Intro | null = null;
const locked = () => !!intro || !!conversation;
function hide() {
  conversation = null;
  SceneDialogue.hide();
  cast.setSpeaker(null);
}
function showLine() {
  if (!conversation?.lines) return;
  const line = conversation.lines[conversation.index];
  cast.setSpeaker(line.speaker);
  SceneDialogue.show(line.text, {
    speaker: line.speaker,
    blocking: true,
    onDone: () => {
      if (!conversation?.lines) return;
      conversation.index++;
      if (conversation.index < conversation.lines.length) showLine();
      else {
        const done = conversation.done;
        hide();
        done?.();
      }
    },
  });
}
function talk(lines: DialogueLine[], done?: () => void) {
  conversation = { lines, index: 0, done };
  showLine();
}
function options() {
  const choices = ActOne.options(api.state()) as unknown as Topic[];
  if (!choices.length) return;
  conversation = { choices: true, index: 0 };
  cast.setSpeaker(null);
  SceneDialogue.choices(choices, (choice: Topic) =>
    talk([{ speaker: 'hero', text: choice.text }], () => {
      if (choice.id === 'lastSeen') {
        const lines = ActOne.dialogue(api.state(), 'lastSeen');
        api.save();
        talk(lines, options);
      }
    }),
  );
}
function walter() {
  const repeat = api.state().flags.walterAsked,
    lines = ActOne.dialogue(api.state(), 'walter');
  api.save();
  talk(lines, repeat ? options : undefined);
}
function reset() {
  hide();
  intro = null;
  cast.init();
}
function update(dt: number, t: number) {
  const s = api.state(),
    hero = api.hero();
  cast.update(dt, s, locked() || hero.pending?.target === 'walter');
  if (
    !intro &&
    !s.flags.introDone &&
    s.room === 'lobby' &&
    !hero.moving &&
    api.ready() &&
    !conversation &&
    cast.ready
  ) {
    const a = Movement.create('lobby'),
      target = Math.min(1740, hero.x + 95);
    Object.assign(a, { x: Math.max(280, Math.min(900, hero.x + 350)), y: 452, direction: 'left' });
    cast.actors.uncle = a;
    Movement.move(a, 'lobby', { x: target, y: Math.max(439, hero.y) }, { facing: 'left' });
    intro = { phase: 'approach', elapsed: 0 };
  }
  if (!intro) return;
  const a = cast.actors.uncle;
  if (!a) return;
  if (intro.phase === 'approach' || intro.phase === 'leave') {
    Movement.tick(a, dt, 'lobby');
    if (!a.moving) {
      if (intro.phase === 'approach') {
        intro.phase = 'talk';
        hero.direction = 'right';
        talk(ActOne.dialogue(s, 'intro'), () => {
          if (!intro) return;
          intro.phase = 'leave';
          Movement.move(a, 'lobby', { x: 806, y: 432 }, { facing: 'up' });
        });
      } else {
        intro.phase = 'lift';
        intro.elapsed = 0;
      }
    }
  } else if (intro.phase === 'lift') {
    intro.elapsed += dt;
    if (intro.elapsed >= 1000) {
      s.flags.introDone = true;
      intro = null;
      cast.actors.uncle = null;
      api.save();
      api.render();
      api.say('Mein Onkel ist unterwegs nach oben. Ich sollte mit Walter sprechen.');
    }
  }
}
function init(adapter: Adapter) {
  api = adapter;
  cast.init();
  const guard = (e: Event) => {
    if (
      locked() &&
      e.target instanceof Element &&
      !e.target.closest('#story-dialogue,.mobile-rail,#mobile-panel,#modal')
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };
  document.addEventListener('click', guard, true);
  document.addEventListener('keydown', guard, true);
}
export const ActOneStory = {
  init,
  update,
  locked,
  reset,
  walter,
  talk,
  thanks: () => talk(ActOne.dialogue(api.state(), 'thanks')),
  get lift() {
    return intro?.phase === 'lift' ? { room: 'lobby', elapsed: intro.elapsed } : null;
  },
  get phase() {
    return intro?.phase ?? '';
  },
};
