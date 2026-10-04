import { prologWorld } from './chapters';
import type { Geometry } from './types';
export interface Point {
  x: number;
  y: number;
}
export interface Pending {
  room?: string;
  target?: string;
  verb?: string;
  selected?: string | null;
  facing?: string;
  [key: string]: unknown;
}
type Segment = Point;
export interface Actor extends Point {
  direction: string;
  route: Point[];
  moving: boolean;
  phase: number;
  pending: Pending | null;
  gesture: number;
  distance: number;
  segment: Segment | null;
}
const maps: Record<string, Geometry> = Object.fromEntries(
  Object.entries(prologWorld.rooms).map(([id, r]) => [id, r.geometry]),
);
function inside(point: Point, polygon: number[][]) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [x, y] = polygon[i],
      [xx, yy] = polygon[j];
    if (y > point.y !== yy > point.y && point.x < ((xx - x) * (point.y - y)) / (yy - y) + x)
      hit = !hit;
  }
  return hit;
}
function walkable(room: string, p: Point) {
  const m = maps[room],
    [rx, ry] = m.clearance || [9, 5];
  return (
    inside(p, m.floor) &&
    !m.obstacles.some(
      ([x, y, xx, yy]) => p.x > x - rx && p.x < xx + rx && p.y > y - ry && p.y < yy + ry,
    )
  );
}
const grid = 12,
  cache: Record<string, Point[]> = {};
function nodes(room: string) {
  if (cache[room]) return cache[room];
  const m = maps[room],
    points: Point[] = [];
  for (let y = 300; y < 516; y += grid)
    for (let x = 36; x < (m.width || 960) - 12; x += grid)
      if (walkable(room, { x, y })) points.push({ x, y });
  return (cache[room] = points);
}
function nearest(room: string, p: Point) {
  return nodes(room).reduce((best, v) =>
    Math.hypot(v.x - p.x, v.y - p.y) < Math.hypot(best.x - p.x, best.y - p.y) ? v : best,
  );
}
function clear(room: string, a: Point, b: Point) {
  const n = Math.ceil(Math.hypot(a.x - b.x, a.y - b.y) / 4);
  for (let i = 0; i <= n; i++) {
    const q = n ? i / n : 0;
    if (!walkable(room, { x: a.x + (b.x - a.x) * q, y: a.y + (b.y - a.y) * q })) return false;
  }
  return true;
}
function path(room: string, from: Point, to: Point): Point[] {
  const start = walkable(room, from) ? from : nearest(room, from),
    end = walkable(room, to) ? to : nearest(room, to);
  if (clear(room, start, end)) return [end];
  const list = nodes(room),
    a = nearest(room, start),
    b = nearest(room, end),
    key = (p: Point) => p.x + ',' + p.y,
    lookup = new Map(list.map((p) => [key(p), p]));
  const open = [a],
    came = new Map<string, Point>(),
    g = new Map([[key(a), 0]]),
    closed = new Set<string>();
  while (open.length) {
    open.sort(
      (x, y) =>
        g.get(key(x))! +
        Math.hypot(x.x - b.x, x.y - b.y) -
        (g.get(key(y))! + Math.hypot(y.x - b.x, y.y - b.y)),
    );
    let cur = open.shift()!;
    const k = key(cur);
    if (k === key(b)) {
      const route = [end, cur];
      while (came.has(key(cur))) {
        cur = came.get(key(cur))!;
        route.push(cur);
      }
      route.reverse();
      route.unshift(start);
      const result: Point[] = [];
      let i = 0;
      while (i < route.length - 1) {
        let j = route.length - 1;
        while (j > i + 1 && !clear(room, route[i], route[j])) j--;
        result.push(route[j]);
        i = j;
      }
      return result;
    }
    closed.add(k);
    for (let dx = -grid; dx <= grid; dx += grid)
      for (let dy = -grid; dy <= grid; dy += grid) {
        if (!dx && !dy) continue;
        const next = lookup.get(cur.x + dx + ',' + (cur.y + dy));
        if (!next || closed.has(key(next)) || !clear(room, cur, next)) continue;
        const cost = g.get(k)! + Math.hypot(dx, dy);
        if (cost < (g.get(key(next)) ?? Infinity)) {
          came.set(key(next), cur);
          g.set(key(next), cost);
          if (!open.includes(next)) open.push(next);
        }
      }
  }
  return [];
}
function scale(room: string, y: number) {
  let m = maps[room],
    t = Math.max(0, Math.min(1, (y - m.minY) / (m.maxY - m.minY)));
  return m.minScale + (m.maxScale - m.minScale) * t;
}
function create(room: string) {
  let m = maps[room];
  return {
    x: m.spawn[0],
    y: m.spawn[1],
    direction: 'down',
    route: [] as Point[],
    moving: false,
    phase: 0,
    pending: null as Pending | null,
    gesture: 0,
    distance: 0,
    segment: null as Segment | null,
  };
}
function cancel(actor: Actor) {
  actor.route = [];
  actor.pending = null;
  actor.moving = false;
  actor.gesture = 0;
}
function move(actor: Actor, room: string, point: Point, pending: Pending | null = null) {
  actor.route = path(room, actor, point);
  actor.pending = actor.route.length ? pending : null;
  actor.moving = actor.route.length > 0;
  return actor.moving;
}
function tick(actor: Actor, dt: number, room: string) {
  dt = Math.max(0, Math.min(dt, 50));
  actor.gesture = Math.max(0, actor.gesture - dt);
  if (!actor.route.length) {
    actor.moving = false;
    return null;
  }
  let remaining = dt;
  while (actor.route.length) {
    const goal = actor.route[0],
      dx = goal.x - actor.x,
      dy = goal.y - actor.y,
      d = Math.hypot(dx, dy),
      speed = 0.205 * (scale(room, actor.y) / 1.8);
    if (d > 0.001) {
      if (actor.segment !== goal) {
        actor.segment = goal;
        actor.direction =
          Math.abs(dx) > Math.abs(dy) * 1.25 ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      }
      const distance = Math.min(d, remaining * speed);
      actor.x += (dx / d) * distance;
      actor.y += (dy / d) * distance;
      actor.phase += distance / speed;
      actor.distance = (actor.distance || 0) + distance;
      remaining -= distance / speed;
      if (distance < d) return null;
    }
    actor.x = goal.x;
    actor.y = goal.y;
    actor.route.shift();
    if (!actor.route.length) {
      actor.moving = false;
      actor.segment = null;
      const action = actor.pending;
      actor.pending = null;
      if (action?.facing) actor.direction = action.facing;
      return action;
    }
    if (remaining <= 0) return null;
  }
  return null;
}

export const Movement = { maps, walkable, path, clear, scale, create, cancel, move, tick };
