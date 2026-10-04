import { Adventure, restoreAct1, restoreProlog } from './core/chapters';
import { encode, decode, saveKey } from './core/save';
import type { GameState } from './core/types';
function read(key: string): unknown {
  try {
    const text = localStorage.getItem(key);
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}
export function readChapter(chapter: 'prolog' | 'act1'): GameState {
  let migrated: GameState | null = null;
  try {
    migrated = decode(localStorage.getItem(saveKey(chapter)), chapter);
  } catch {}
  if (migrated) return chapter === 'prolog' ? restoreProlog(migrated) : restoreAct1(migrated, null);
  return chapter === 'prolog'
    ? restoreProlog(read('success-prolog-v1'))
    : restoreAct1(read('success-act1-exploration-v1'), read('success-act1-v1'));
}
export function writeChapter(chapter: 'prolog' | 'act1', state: GameState) {
  try {
    localStorage.setItem(
      saveKey(chapter),
      encode(chapter, { ...state, journal: state.journal ?? [] }),
    );
  } catch {
    document.getElementById('scene')?.setAttribute('data-save-error', 'true');
  }
}
