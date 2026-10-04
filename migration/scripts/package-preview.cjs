// Package only built HTML/JS/CSS; existing production art is verified by the full manifest.
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto'),
  cp = require('node:child_process');
const root = path.resolve(__dirname, '..'),
  dist = path.join(root, 'dist'),
  out = path.join(root, '.qa');
fs.mkdirSync(out, { recursive: true });
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
const list = files(dist),
  manifest =
    list
      .map(
        (f) =>
          crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex') +
          '  ' +
          path.relative(dist, f).replaceAll('\\', '/'),
      )
      .join('\n') + '\n';
fs.writeFileSync(path.join(out, 'preview.sha256'), manifest);
const code = list.filter((f) => /\.(html|js|css)$/.test(f)).map((f) => path.relative(dist, f));
cp.execFileSync('tar', ['-czf', path.join(out, 'preview.tar.gz'), '-C', dist, ...code]);
console.log(
  'Packaged ' +
    code.length +
    ' build files; manifest covers ' +
    list.length +
    ' files including reused art.',
);
