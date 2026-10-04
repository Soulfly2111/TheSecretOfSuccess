const fs = require('node:fs'),
  path = require('node:path');
const root = path.resolve(__dirname, '../..'),
  dest = path.resolve(__dirname, '../tests/browser');
fs.mkdirSync(dest, { recursive: true });
function port(s) {
  return s
    .replace(
      "process.env.QA_URL||'http://127.0.0.1:8765/'",
      "process.env.QA_URL||'http://127.0.0.1:8770/'",
    )
    .replace(
      "process.env.QA_OUTPUT||'C:/Users/Heine/.codex/workspaces/adventure-qa/radial'",
      "process.env.QA_OUTPUT||'.qa'",
    )
    .replace(
      /typeof ActOneWorld==='undefined'/g,
      "window.AdventureGame.snapshot().chapter==='prolog'",
    )
    .replace(/A\.Photo\.ready\(state\)/g, 'window.AdventureGame.snapshot().ready')
    .replace(/ActOneWorld\.route\(state.room,d\)/g, 'window.AdventureGame.route(d)')
    .replace(/ActOneStory.phase/g, 'window.AdventureGame.snapshot().story')
    .replace(/\bstate\b/g, 'window.AdventureGame.snapshot().state')
    .replace(/\bactor\b/g, 'window.AdventureGame.snapshot().actor')
    .replace(/\btransition\b/g, 'window.AdventureGame.snapshot().transition')
    .replace(/\bphotoJob\b/g, 'window.AdventureGame.snapshot().photoJob');
}
for (const n of [
  'qa-radial.cjs',
  'test-radial-prolog.cjs',
  'test-radial-act1.cjs',
  'test-direct-input.cjs',
])
  fs.writeFileSync(path.join(dest, n), port(fs.readFileSync(path.join(root, n), 'utf8')));
console.log('Browser tests use read-only AdventureGame public snapshots and visible controls.');
