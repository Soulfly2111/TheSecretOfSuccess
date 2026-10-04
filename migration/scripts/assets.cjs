const fs = require('node:fs'),
  path = require('node:path');
const root = path.resolve(__dirname, '../..'),
  out = path.resolve(__dirname, '../public/assets');
fs.mkdirSync(out, { recursive: true });
const assets = new Set([
  'locations.png',
  'act1-uncle-animation-v1.png',
  'act1-walter-animation-v1.png',
  'act1-uncle-talk-v2.json',
  'act1-uncle-talk-v2.png',
]);
for (const file of ['renderer.js', 'act1-renderer.js', 'act1-cast.js', 'act1.js']) {
  const text = fs.readFileSync(path.join(root, 'migration/src/shell', file), 'utf8');
  for (const match of text.matchAll(/assets\/([\w-]+\.(?:png|json))/g)) assets.add(match[1]);
}
for (const asset of assets) {
  const source = path.join(root, 'assets', asset);
  if (!fs.existsSync(source)) throw Error('Missing asset ' + asset);
  fs.copyFileSync(source, path.join(out, asset));
}
console.log('Prepared ' + assets.size + ' referenced assets.');
