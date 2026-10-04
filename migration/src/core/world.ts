import { act1World } from './chapters';
import { followCamera } from './coordinates';
import type { Connection, Geometry } from './types';
const { rooms, npcs, connections, entries } = act1World;
export const ActOneWorld = {
  rooms,
  npcs,
  connections,
  entries,
  floors: ['lobby', 'upper', 'second'],
  install: (movement: { maps: Record<string, Geometry> }) => {
    for (const [id, room] of Object.entries(rooms)) {
      movement.maps[id] = room.geometry;
    }
  },
  cameraX: (room: string, x: number) => followCamera(x, rooms[room].width),
  connection: (room: string, target: string, destination?: string) =>
    connections[room]?.find((e) => e.target === target && (!destination || e.to === destination)),
  entry: (edge: Connection) => entries[edge.to][edge.entry],
  liftOptions: (room: string) =>
    ['lobby', 'upper', 'second'].map((id) => ({
      id,
      label: rooms[id].label,
      current: id === room,
    })),
  route: (from: string, to: string): Connection[] => {
    const queue = [{ room: from, path: [] as Connection[] }],
      seen = new Set([from]);
    while (queue.length) {
      const current = queue.shift()!;
      if (current.room === to) return current.path;
      for (const e of connections[current.room] ?? [])
        if (!seen.has(e.to)) {
          seen.add(e.to);
          queue.push({ room: e.to, path: [...current.path, e] });
        }
    }
    return [];
  },
};
