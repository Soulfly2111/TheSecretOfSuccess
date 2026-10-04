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
    [
      ['lobby', rooms.lobby.label, ''],
      ['upper', rooms.upper.label, ''],
      ['second', rooms.second.label, ''],
      ['third', '3. Etage', 'Zutritt nur mit gültiger Büropolitik.'],
      ['fourth', '4. Etage', 'Nur für Menschen mit Kalenderhoheit.'],
      ['fifth', '5. Etage', 'Budgetzone. Bitte nicht direkt ansehen.'],
      ['sixth', '6. Etage', 'Strategie. Zutritt macht die Sache nicht klarer.'],
      ['seventh', '7. Etage', 'Vorstand. Sauerstoff optional.'],
    ].map(([id, label, locked]) => ({ id, label, current: id === room, locked })),
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
