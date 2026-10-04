import visibility from '../content/prolog-visibility.json';
import { AdventureEngine } from './engine';
import type { ChapterLogic, GameState, Value } from './types';
const engine = new AdventureEngine(visibility as unknown as ChapterLogic);
export const SceneState = {
  objects: (state: GameState) =>
    engine.run('objects', [state as unknown as Value]) as Record<string, boolean>,
};
