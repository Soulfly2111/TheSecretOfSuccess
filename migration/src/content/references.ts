import type { ChapterLogic, Expression, Command, World } from '../core/types';

/** Validate statically resolvable references without interpreting game state. */
export function validateReferences(logic: ChapterLogic, items: Record<string, string>) {
  for (const program of Object.values(logic.programs)) {
    const bindings = new Set([...Object.keys(logic.constants), ...program.parameters]);
    const collect = (list: Command[]) => {
      for (const c of list) {
        if (c.kind === 'let') bindings.add(c.name);
        if (c.kind === 'branch') {
          collect(c.yes);
          collect(c.no);
        }
      }
    };
    collect(program.commands);
    const expression = (e: Expression) => {
      if ('ref' in e && !bindings.has(e.ref[0])) throw Error('Unknown binding ' + e.ref[0]);
      if ('op' in e) {
        const item = e.args.at(-1);
        if (
          ['has', 'add', 'remove'].includes(e.op) &&
          item &&
          'literal' in item &&
          typeof item.literal === 'string' &&
          !(item.literal in items)
        )
          throw Error('Unknown item ' + item.literal);
        e.args.forEach(expression);
      } else if ('list' in e) e.list.forEach(expression);
      else if ('record' in e) Object.values(e.record).forEach(expression);
    };
    const commands = (list: Command[]) => {
      for (const c of list) {
        if (c.kind === 'branch') {
          expression(c.condition);
          commands(c.yes);
          commands(c.no);
        } else {
          expression(c.value);
          if (c.kind === 'set') c.path.forEach(expression);
        }
      }
    };
    commands(program.commands);
  }
}

const point = (p: unknown): boolean =>
  Array.isArray(p) &&
  p.length >= 2 &&
  p.slice(0, 2).every((n) => typeof n === 'number' && Number.isFinite(n));
export function validateGeometry(world: World) {
  for (const [id, room] of Object.entries(world.rooms)) {
    const g = room.geometry;
    if (!point(g.spawn) || !g.floor.every(point)) throw Error('Invalid geometry ' + id);
    if (
      !g.obstacles.every(
        (rect) => rect.length === 4 && rect.every(Number.isFinite) && rect[2] >= 0 && rect[3] >= 0,
      )
    )
      throw Error('Invalid obstacle ' + id);
    if (
      !Array.isArray(room.camera) ||
      room.camera.length !== 2 ||
      !room.camera.every(Number.isFinite) ||
      room.camera[0] > room.camera[1]
    )
      throw Error('Invalid camera ' + id);
    for (const object of room.objects) {
      if (object.slice(2, 6).some((n) => typeof n !== 'number' || !Number.isFinite(n)))
        throw Error('Invalid hotspot ' + object[0]);
      if (object.length > 6 && !point(g.spots[String(object[0])]))
        throw Error('Invalid interaction point ' + object[0]);
    }
  }
  for (const id of Object.keys(world.connections))
    if (!world.rooms[id]) throw Error('Unknown connection source ' + id);
  for (const [id, entries] of Object.entries(world.entries)) {
    if (!world.rooms[id]) throw Error('Unknown entry room ' + id);
    for (const entry of Object.values(entries))
      if (!point(entry)) throw Error('Invalid entry ' + id);
  }
}
