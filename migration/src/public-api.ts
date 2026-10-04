import type { GameState, Connection } from './core/types';
import type { Actor } from './core/movement';
export interface Snapshot {
  chapter: 'prolog' | 'act1';
  state: GameState;
  actor: Actor;
  transition: unknown;
  photoJob: unknown;
  story: string;
  ready: boolean;
}
export interface PublicGameAPI {
  snapshot: () => Readonly<Snapshot>;
  route: (destination: string) => Connection[];
}
declare global {
  interface Window {
    AdventureGame: PublicGameAPI;
  }
}
export function exposeSnapshot(
  snapshot: () => Snapshot,
  route: (destination: string) => Connection[],
) {
  window.AdventureGame = Object.freeze({
    snapshot: () => Object.freeze(structuredClone(snapshot())),
    route: (destination: string) => structuredClone(route(destination)),
  });
}
