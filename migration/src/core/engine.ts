import type { Value, Expression, Command, ChapterLogic, GameState } from './types';
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
function record(v: Value): Record<string, Value> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw Error('Expected record');
  return v;
}
export class AdventureEngine {
  private depth = 0;
  private remaining = 20000;
  constructor(
    readonly logic: ChapterLogic,
    readonly extensions: Record<string, (args: Value[]) => Value> = {},
  ) {}
  run(name: string, args: Value[]): Value {
    if (this.depth === 0) this.remaining = 20000;
    if (this.depth > 64) throw Error('Adventure call depth exceeded');
    const p = this.logic.programs[name];
    if (!p) throw Error('Unknown adventure program ' + name);
    const scope: Record<string, Value> = { ...this.logic.constants };
    p.parameters.forEach((key, i) => (scope[key] = args[i] ?? null));
    this.depth++;
    try {
      return this.commands(p.commands, scope).value;
    } finally {
      this.depth--;
    }
  }
  private commands(
    commands: Command[],
    scope: Record<string, Value>,
  ): { returned: boolean; value: Value } {
    for (const c of commands) {
      if (c.kind === 'branch') {
        const result = this.commands(this.evaluate(c.condition, scope) ? c.yes : c.no, scope);
        if (result.returned) return result;
      } else if (c.kind === 'let') {
        scope[c.name] = this.evaluate(c.value, scope);
      } else if (c.kind === 'set') {
        const keys = c.path.map((x) => String(this.evaluate(x, scope)));
        let target: Record<string, Value> = scope;
        for (const key of keys.slice(0, -1)) {
          this.key(key);
          target = record(target[key]);
        }
        const key = keys.at(-1)!;
        this.key(key);
        if (c.operator === '||=' && target[key]) continue;
        target[key] = this.evaluate(c.value, scope);
      } else {
        const value = this.evaluate(c.value, scope);
        if (c.kind === 'return') return { returned: true, value };
      }
    }
    return { returned: false, value: null };
  }
  private key(key: string) {
    if (forbidden.has(key)) throw Error('Forbidden adventure field');
  }
  private evaluate(e: Expression, s: Record<string, Value>): Value {
    if (--this.remaining < 0) throw Error('Adventure operation budget exceeded');
    if ('literal' in e) return e.literal;
    if ('ref' in e) {
      let value: Value = s;
      for (const key of e.ref) {
        this.key(key);
        value =
          value && typeof value === 'object' && !Array.isArray(value) ? (value[key] ?? null) : null;
      }
      return value;
    }
    if ('list' in e) return e.list.map((x) => this.evaluate(x, s));
    if ('record' in e)
      return Object.fromEntries(
        Object.entries(e.record).map(([k, v]) => {
          this.key(k);
          return [k, this.evaluate(v, s)];
        }),
      );
    const at = (i: number) => this.evaluate(e.args[i], s);
    if (e.op === 'and') {
      const first = at(0);
      return first ? at(1) : first;
    }
    if (e.op === 'or') return at(0) || at(1);
    if (e.op === 'coalesce') {
      const a = at(0);
      return a === null ? at(1) : a;
    }
    if (e.op === 'choose') return at(0) ? at(1) : at(2);
    if (e.op === 'not') return !at(0);
    if (e.op === 'get') {
      const a = at(0),
        key = String(at(1));
      this.key(key);
      return a && typeof a === 'object' && !Array.isArray(a) ? (a[key] ?? null) : null;
    }
    if (e.op === 'eq') return at(0) === at(1);
    if (e.op === 'ne') return at(0) !== at(1);
    if (e.op === 'concat') return e.args.map((x) => String(this.evaluate(x, s) ?? '')).join('');
    if (e.op === 'includes') {
      const a = at(0);
      return Array.isArray(a)
        ? a.includes(at(1))
        : typeof a === 'string'
          ? a.includes(String(at(1)))
          : false;
    }
    if (e.op === 'has')
      return ((s.state ?? s.s) as unknown as GameState).inventory.includes(String(at(0)));
    if (e.op === 'add') {
      const state = (s.state ?? s.s) as unknown as GameState,
        id = String(at(e.args.length - 1));
      if (!state.inventory.includes(id)) state.inventory.push(id);
      return null;
    }
    if (e.op === 'remove') {
      const state = (s.state ?? s.s) as unknown as GameState,
        id = String(at(0));
      state.inventory = state.inventory.filter((x) => x !== id);
      return null;
    }
    if (e.op === 'note') {
      const state = (s.state ?? s.s) as unknown as GameState,
        text = String(at(e.args.length - 1));
      if (!state.journal.includes(text)) state.journal.push(text);
      return null;
    }
    if (e.op === 'push') {
      const array = at(0);
      if (!Array.isArray(array)) throw Error('Expected array');
      array.push(...e.args.slice(1).map((x) => this.evaluate(x, s)));
      return array.length;
    }
    if (e.op === 'filterOut') {
      const a = at(0),
        v = at(1);
      if (!Array.isArray(a)) throw Error('Expected array');
      return a.filter((x) => x !== v);
    }
    if (e.op === 'joinLines') {
      const a = at(0);
      return Array.isArray(a) ? a.map((x) => record(x).text).join(' ') : '';
    }
    if (e.op.startsWith('call:'))
      return this.run(
        e.op.slice(5),
        e.args.map((x) => this.evaluate(x, s)),
      );
    const extension = this.extensions[e.op];
    if (extension) return extension(e.args.map((x) => this.evaluate(x, s)));
    throw Error('Unsupported adventure operation ' + e.op);
  }
}
