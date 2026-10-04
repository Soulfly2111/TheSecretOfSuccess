import data from '../content/actions.json';
import { ActOneWorld } from './world';
import type { GameState } from './types';
import { prologWorld } from './chapters';
type ActionEntry = string | string[];
const group = (entry: ActionEntry | undefined): string[] =>
  Array.isArray(entry)
    ? entry
    : [...((data.groups as Record<string, string[]>)[entry ?? 'look'] ?? data.groups.look)];
export const ContextActions = {
  prolog: (s: GameState, id: string): string[] => {
    const f = s.flags,
      has = (item: string) => s.inventory.includes(item);
    if (prologWorld.rooms[id]) return group('passage');
    if (id === 'toolbox')
      return [f.toolbox ? 'Schließe' : 'Öffne', ...(!has('wrench') ? ['Nimm'] : []), 'Schau an'];
    if (id === 'cupboard' || id === 'chest') return [f[id] ? 'Schließe' : 'Öffne', 'Schau an'];
    if (id === 'car') return ['Schau an', f.hood ? 'Schließe' : 'Öffne', 'Mach an'];
    return group((data.prolog as Record<string, ActionEntry>)[id]);
  },
  act1: (s: GameState, id: string): string[] => {
    const edge = ActOneWorld.connection(s.room, id);
    if (edge) {
      if (
        edge.kind === 'stairs' ||
        edge.kind === 'elevator' ||
        !edge.flag ||
        ['lobbyExit', 'upperExit', 'secondExit'].includes(id)
      )
        return group('passage');
      return group(s.flags[edge.flag] ? 'doorOpen' : 'doorClosed');
    }
    if (ActOneWorld.npcs[id]) return group('person');
    if (id === 'lightSwitch') return ['Schau an', s.flags.cleaningLightOn ? 'Mach aus' : 'Mach an'];
    if (id === 'locker' && s.room === 'ems')
      return [s.flags.lockerOpen ? 'Schließe' : 'Öffne', 'Schau an'];
    if (id === 'drawer') return [s.flags.drawerOpen ? 'Schließe' : 'Öffne', 'Schau an'];
    if (id === 'brochureStand') return group(s.flags.brochureTaken ? 'look' : 'pickup');
    return group((data.act1 as Record<string, ActionEntry>)[id]);
  },
};
