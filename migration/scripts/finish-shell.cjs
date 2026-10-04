const fs = require('node:fs'),
  path = require('node:path');
const dir = path.resolve(__dirname, '../src/shell');
for (const file of ['renderer.js', 'act1-renderer.js', 'act1-cast.js', 'act1.js']) {
  const p = path.join(dir, file);
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes('import {assetImage}')) {
    s =
      "import {assetImage} from '../presentation/assets';\n" +
      s.replace(/new Image\(\)/g, 'assetImage()');
  }
  fs.writeFileSync(p, s);
}
const css = path.resolve(__dirname, '../style.css');
fs.writeFileSync(
  css,
  fs
    .readFileSync(css, 'utf8')
    .replace("background-image:url('assets/locations.png')", 'background-image:none'),
);
