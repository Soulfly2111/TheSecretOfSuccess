// Place the tested Vite output at the repository's existing static game URLs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const dist = path.join(root, 'migration/dist');
const digest = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const assets = path.join(dist, 'assets');

for (const name of fs.readdirSync(assets)) {
  const source = path.join(assets, name);
  if (!fs.statSync(source).isFile()) continue;
  const target = path.join(root, 'assets', name);
  if (/\.(png|json)$/.test(name)) {
    if (!fs.existsSync(target) || digest(target) !== digest(source))
      throw Error('Existing game asset differs: ' + name);
  } else if (/\.(js|css)$/.test(name)) {
    if (fs.existsSync(target) && digest(target) !== digest(source))
      throw Error('Build asset name collision: ' + name);
    fs.copyFileSync(source, target);
  } else throw Error('Unexpected build asset ' + name);
}
for (const name of ['index.html', 'act1.html']) {
  fs.copyFileSync(path.join(dist, name), path.join(root, name));
}
console.log('Promoted verified static build to repository root.');
