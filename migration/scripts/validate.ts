import { validateLogic, validateWorld } from '../src/content/validate';
import { validateReferences, validateGeometry } from '../src/content/references';
import type { ChapterLogic, World } from '../src/core/types';
import { readFileSync } from 'node:fs';
const read = (name: string) =>
  JSON.parse(readFileSync(new URL('../src/content/' + name + '.json', import.meta.url), 'utf8'));
const items = read('items');
validateLogic(read('prolog-visibility') as ChapterLogic);
validateReferences(read('prolog-visibility') as ChapterLogic, items.prolog);
for (const chapter of ['prolog', 'act1']) {
  const logic = read(chapter + '-logic') as ChapterLogic,
    world = read(chapter + '-world') as World;
  validateLogic(logic);
  validateReferences(logic, items[chapter]);
  validateWorld(world);
  validateGeometry(world);
}
console.log(
  'PASS content: bounded programs, binding/item references, geometry, unique hotspots and room connections',
);
