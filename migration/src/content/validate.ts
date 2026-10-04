import type { ChapterLogic, Expression, Command, World } from '../core/types';
const operations = new Set([
  'and',
  'or',
  'coalesce',
  'choose',
  'not',
  'get',
  'eq',
  'ne',
  'concat',
  'includes',
  'has',
  'add',
  'remove',
  'note',
  'push',
  'filterOut',
  'joinLines',
]);
const unsafe = new Set(['__proto__', 'constructor', 'prototype']);
const safe = (value: unknown) =>
  typeof value === 'string' && value.length > 0 && !unsafe.has(value);
const arity: Record<string, number[]> = {
  and: [2],
  or: [2],
  coalesce: [2],
  choose: [3],
  not: [1],
  get: [2],
  eq: [2],
  ne: [2],
  includes: [2],
  has: [1],
  add: [1, 2],
  remove: [1],
  note: [1, 2],
  filterOut: [2],
  joinLines: [1],
};
export function validateLogic(logic: ChapterLogic) {
  const check = (e: Expression) => {
    if (!e || typeof e !== 'object') throw Error('Invalid expression');
    if ('op' in e) {
      if (!operations.has(e.op) && !e.op.startsWith('call:'))
        throw Error('Unknown operation ' + e.op);
      if (e.op.startsWith('call:') && !logic.programs[e.op.slice(5)])
        throw Error('Unknown program ' + e.op);
      if (!Array.isArray(e.args)) throw Error('Invalid arguments');
      const counts = arity[e.op];
      if (counts && !counts.includes(e.args.length)) throw Error('Invalid arity ' + e.op);
      if (
        e.op.startsWith('call:') &&
        e.args.length !== logic.programs[e.op.slice(5)].parameters.length
      )
        throw Error('Invalid program arity ' + e.op);
      if (e.op === 'push' && e.args.length < 2) throw Error('Invalid push');
      e.args.forEach(check);
    } else if ('ref' in e) {
      if (
        !Array.isArray(e.ref) ||
        !e.ref.length ||
        e.ref.some(
          (k) => typeof k !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(k),
        )
      )
        throw Error('Invalid reference');
    } else if ('list' in e) e.list.forEach(check);
    else if ('record' in e)
      Object.entries(e.record).forEach(([k, v]) => {
        if (['__proto__', 'constructor', 'prototype'].includes(k)) throw Error('Unsafe record');
        check(v);
      });
    else if (!('literal' in e)) throw Error('Unknown expression');
  };
  const commands = (list: Command[]) => {
    if (!Array.isArray(list)) throw Error('Invalid commands');
    for (const c of list) {
      if (c.kind === 'branch') {
        check(c.condition);
        commands(c.yes);
        commands(c.no);
      } else if (c.kind === 'set') {
        if (c.operator && !['=', '||='].includes(c.operator)) throw Error('Invalid assignment');
        c.path.forEach(check);
        check(c.value);
      } else if (['return', 'effect', 'let'].includes(c.kind)) {
        if (c.kind === 'let' && !safe(c.name)) throw Error('Invalid binding');
        check((c as Exclude<Command, { kind: 'branch' }>).value);
      } else throw Error('Unknown command');
    }
  };
  for (const key of Object.keys(logic.constants)) if (!safe(key)) throw Error('Invalid constant');
  for (const [name, p] of Object.entries(logic.programs)) {
    if (!safe(name) || !Array.isArray(p.parameters) || p.parameters.some((n) => !safe(n)))
      throw Error('Invalid parameters');
    commands(p.commands);
  }
}
export function validateWorld(world: World) {
  for (const [id, r] of Object.entries(world.rooms)) {
    if (!r.name || !r.label || !r.geometry || r.geometry.floor.length < 3)
      throw Error('Invalid room ' + id);
    const ids = new Set<string>();
    for (const o of r.objects) {
      if (typeof o[0] !== 'string' || ids.has(o[0]))
        throw Error('Duplicate/invalid object in ' + id);
      ids.add(o[0]);
      if (!Array.isArray(r.geometry.spots[o[0]]) && o.length > 6)
        throw Error('Missing interaction point ' + o[0]);
    }
    for (const e of world.connections[id] ?? []) {
      if (!world.rooms[e.to] || !ids.has(e.target) || !world.entries[e.to]?.[e.entry])
        throw Error('Broken connection ' + id + ' / ' + e.target);
    }
    if (r.geometry.spawn.some((n) => !Number.isFinite(n))) throw Error('Invalid spawn ' + id);
  }
}
