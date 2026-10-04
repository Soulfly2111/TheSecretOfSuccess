import type { GameState } from './types';
export interface SaveEnvelope {
  schemaVersion: 1;
  chapter: 'prolog' | 'act1';
  savedAt: string;
  state: GameState;
}
export const saveKey = (chapter: 'prolog' | 'act1') => 'success-migration-v1-' + chapter;
export function encode(chapter: 'prolog' | 'act1', state: GameState): string {
  return JSON.stringify({
    schemaVersion: 1,
    chapter,
    savedAt: new Date().toISOString(),
    state,
  } satisfies SaveEnvelope);
}
export function decode(text: string | null, chapter: 'prolog' | 'act1'): GameState | null {
  if (!text) return null;
  try {
    const v: unknown = JSON.parse(text);
    if (!v || typeof v !== 'object') return null;
    const envelope = v as Partial<SaveEnvelope>,
      s = envelope.state;
    if (
      envelope.schemaVersion !== 1 ||
      envelope.chapter !== chapter ||
      !s ||
      typeof s.room !== 'string' ||
      !Array.isArray(s.inventory) ||
      !s.inventory.every((x) => typeof x === 'string') ||
      !s.flags ||
      typeof s.flags !== 'object' ||
      Array.isArray(s.flags) ||
      !Object.values(s.flags).every((x) => typeof x === 'boolean') ||
      !Array.isArray(s.journal) ||
      !s.journal.every((x) => typeof x === 'string')
    )
      return null;
    return structuredClone(s);
  } catch {
    return null;
  }
}
