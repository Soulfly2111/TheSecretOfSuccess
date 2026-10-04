export type Value = null | boolean | number | string | Value[] | { [key: string]: Value };
export interface GameState {
  room: string;
  inventory: string[];
  flags: Record<string, boolean>;
  journal: string[];
  won?: boolean;
  version?: number;
}
export type Operation =
  | 'and'
  | 'or'
  | 'coalesce'
  | 'choose'
  | 'not'
  | 'get'
  | 'eq'
  | 'ne'
  | 'concat'
  | 'includes'
  | 'has'
  | 'add'
  | 'remove'
  | 'note'
  | 'push'
  | 'filterOut'
  | 'joinLines'
  | `call:${string}`;
export type Expression =
  | { literal: Value }
  | { ref: string[] }
  | { op: Operation; args: Expression[] }
  | { list: Expression[] }
  | { record: Record<string, Expression> };
export type Command =
  | { kind: 'branch'; condition: Expression; yes: Command[]; no: Command[] }
  | { kind: 'set'; path: Expression[]; value: Expression; operator?: '=' | '||=' }
  | { kind: 'let'; name: string; value: Expression }
  | { kind: 'return' | 'effect'; value: Expression };
export interface Program {
  parameters: string[];
  commands: Command[];
}
export interface ChapterLogic {
  programs: Record<string, Program>;
  constants: Record<string, Value>;
}
export interface World {
  rooms: Record<
    string,
    {
      name: string;
      label: string;
      sub: string;
      entry: string;
      width?: number;
      objects: Value[][];
      geometry: Geometry;
      camera: number[];
    }
  >;
  connections: Record<string, Connection[]>;
  entries: Record<string, Record<string, Value[]>>;
  npcs: Record<string, Value[]>;
}
export interface Connection {
  target: string;
  to: string;
  entry: string;
  kind?: string;
  flag?: string;
}
export interface Geometry {
  floor: number[][];
  obstacles: number[][];
  spawn: number[];
  spots: Record<string, Value[]>;
  width?: number;
  minY: number;
  maxY: number;
  minScale: number;
  maxScale: number;
  entries?: Record<string, number[]>;
  npc?: number[];
  clearance?: number[];
}
