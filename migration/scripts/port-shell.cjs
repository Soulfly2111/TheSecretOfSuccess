// Mechanical ESM conversion of the reference presentation shell, preserving behavior.
const fs = require('node:fs'),
  path = require('node:path');
const root = path.resolve(__dirname, '../..'),
  dest = path.resolve(__dirname, '../src/shell');
fs.mkdirSync(dest, { recursive: true });
const read = (n) => fs.readFileSync(path.join(root, n), 'utf8'),
  write = (n, s) => fs.writeFileSync(path.join(dest, n), s);
const dependencies = {
  renderer: "import {Movement} from '../core/movement';import {SceneState} from './scene-state';",
  'act1-cast': "import {Movement} from '../core/movement';",
  'act1-story':
    "import {Movement} from '../core/movement';import {ActOne} from '../core/chapters';import {ActOneCast} from './act1-cast';import {SceneDialogue} from './dialogue';",
  'act1-renderer':
    "import {Movement} from '../core/movement';import {ActOne,act1World} from '../core/chapters';import {ActOneWorld} from '../core/world';import {ActOneCast} from './act1-cast';import {PixelScene} from './renderer';",
  dialogue: "import {Speakers} from './speakers';",
};
for (const [file, name] of [
  ['renderer', 'PixelScene'],
  ['act1-cast', 'ActOneCast'],
  ['act1-story', 'ActOneStory'],
  ['act1-renderer', 'ActOneScene'],
  ['speakers', 'Speakers'],
  ['dialogue', 'SceneDialogue'],
]) {
  let s = read(file + '.js');
  s =
    (dependencies[file] || '') +
    '\n' +
    s.replace('const ' + name + '=', 'export const ' + name + '=');
  if (file === 'renderer')
    s = s.replace(
      'return {render,drawActor:actor,',
      'return {render,background,objectStates,drawActor:actor,',
    );
  if (file === 'act1-renderer') {
    s = s.replace('ctx.translate(-camera*2/3,0);', '');
    s = s.replace('  const actors=[];', "  rendererLayer('background',0);const actors=[];");
    s = s.replace(
      'actors.sort((x,y)=>x.y-y.y).forEach(x=>x.draw());',
      "actors.sort((x,y)=>x.y-y.y).forEach((x,i)=>{rendererLayer('actor-'+i,x.y);x.draw();});rendererLayer('foreground',10000);",
    );
    s = "import {rendererLayer} from '../presentation/phaser';\n" + s;
  }
  if (file === 'act1-cast')
    s = s.replace(
      "fetch('assets/act1-uncle-talk-v2.json')",
      "fetch(new URL('assets/act1-uncle-talk-v2.json',document.baseURI))",
    );
  write(file + '.js', s);
}
for (const [file, name] of [
  ['scene-state', 'SceneState'],
  ['context-actions', 'ContextActions'],
  ['mobile', 'MobileUI'],
]) {
  let s = read(file + '.js');
  s = s.replace('(function(root){', '');
  s = s.replace(
    /const api=\{([^;]+)\};if\(typeof module[^\n]+\n/,
    'export const ' + name + '={$1};\n',
  );
  s = s.replace(/\}\)\(typeof window[^\n]+\n?/, '');
  if (file === 'mobile') {
    s =
      "import {SceneDialogue} from './dialogue';\n" +
      s.replace('root.MobileUI=', 'export const MobileUI=');
    s = s.replace('})(window);', '');
    s += '\nwindow.MobileUI=MobileUI;\n';
  }
  write(file + '.js', s);
}
const common =
  "import {Movement} from '../core/movement';import {PixelScene} from './renderer';import {SceneDialogue} from './dialogue';import {MobileUI} from './mobile';import {ContextActions} from './context-actions';import {PhaserPresentation} from '../presentation/phaser';import {readChapter,writeChapter} from '../storage';\n";
let p = read('game.js');
p = p.replace(/const rooms=\{[\s\S]*?\nlet state=/, 'const rooms=prologWorld.rooms;\nlet state=');
p =
  common +
  "import {Adventure,prologWorld} from '../core/chapters';import {SceneState} from './scene-state';\n" +
  p;
const start = p.indexOf('try{const saved='),
  end = p.indexOf('let actor=', start);
p = p.slice(0, start) + "if(!scratch)state=readChapter('prolog');\n" + p.slice(end);
p = p.replace(
  /function save\(\)\{[^\n]+/,
  "function save(){if(!scratch)writeChapter('prolog',state);}",
);
p = p.replace(
  "const ctx=$('actors').getContext('2d');",
  "const presentation=new PhaserPresentation('prolog');",
);
p = p.replace(
  'PixelScene.render(ctx,state,actor,t);',
  'presentation.renderProlog(PixelScene,state,actor,t);',
);
p += '\n' + read('chapters.js');
write('game.js', p);
let a =
  common +
  "import {ActOne} from '../core/chapters';import {ActOneWorld} from '../core/world';import {ActOneCast} from './act1-cast';import {ActOneStory} from './act1-story';import {ActOneScene} from './act1-renderer';\n" +
  read('act1.js');
a = a.replace(
  'if(!scratch)state=A.restore(readSave(saveKey),readSave(A.legacyKey),Object.keys(rooms));',
  "if(!scratch)state=readChapter('act1');",
);
a = a.replace(
  /function save\(\)\{[^\n]+/,
  "function save(){if(!scratch)writeChapter('act1',state);}",
);
a = a.replace(
  "const ctx=$('actors').getContext('2d');",
  "const presentation=new PhaserPresentation('act1');",
);
a = a.replace(
  'ActOneScene.render(ctx,state,actor,t,camera,ActOneStory.lift||liftVisual,{job:photoJob,flash:photoFlash});',
  'presentation.renderAct1(ActOneScene,state,actor,t,camera,ActOneStory.lift||liftVisual,{job:photoJob,flash:photoFlash});',
);
write('act1.js', a);
// Entry points keep the accessible HTML overlays but use a single ESM entry.
for (const chapter of ['index', 'act1']) {
  let html = read(chapter + '.html')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/href="(style|act1|mobile|dialogue)\.css[^\"]*"/g, 'href="./$1.css"');
  html = html.replace(
    '</body>',
    `<script type="module" src="/src/shell/${chapter === 'index' ? 'game' : 'act1'}.js"></script></body>`,
  );
  fs.writeFileSync(path.resolve(__dirname, '../' + chapter + '.html'), html);
}
for (const css of ['style', 'act1', 'mobile', 'dialogue'])
  fs.copyFileSync(path.join(root, css + '.css'), path.resolve(__dirname, '../' + css + '.css'));
// Geometry is TypeScript; JSON owns its maps, including prolog and Act 1.
let m = read('movement.js');
const begin = m.indexOf('function inside('),
  finish = m.indexOf('const api=');
m = m.slice(begin, finish);
m = m.replace(/function (\w+)\(([^)]*)\)/g, (match, name, args) => {
  const types = {
    room: 'string',
    point: 'Point',
    p: 'Point',
    a: 'Point',
    b: 'Point',
    from: 'Point',
    to: 'Point',
    polygon: 'number[][]',
    y: 'number',
    actor: 'Actor',
    dt: 'number',
    pending: 'Pending | null',
  };
  return `function ${name}(${args
    .split(',')
    .filter(Boolean)
    .map((a) => {
      if (a.includes('=')) return a.replace('pending=null', 'pending: Pending | null=null');
      return a + ': ' + (types[a] || 'number');
    })
    .join(',')})`;
});
m = m
  .replace('const grid=12,cache={};', 'const grid=12,cache:Record<string,Point[]>={};')
  .replace('points=[]', 'points:Point[]=[]')
  .replace(
    'route:[],moving:false,phase:0,pending:null,gesture:0',
    'route:[] as Point[],moving:false,phase:0,pending:null as Pending|null,gesture:0,distance:0,segment:null as Segment|null',
  );
m = m.replace(
  'function path(room: string,from: Point,to: Point)',
  'function path(room: string,from: Point,to: Point):Point[]',
);
write('unused', '');
fs.unlinkSync(path.join(dest, 'unused'));
fs.mkdirSync(path.resolve(__dirname, '../src/core'), { recursive: true });
fs.writeFileSync(
  path.resolve(__dirname, '../src/core/movement.ts'),
  `import {prologWorld} from './chapters';import type {Geometry} from './types';\nexport interface Point{x:number;y:number}\nexport interface Pending{room?:string;target?:string;verb?:string;selected?:string|null;facing?:string;[key:string]:unknown}\ninterface Segment{from:Point;to:Point;length:number;progress:number}\nexport interface Actor extends Point{direction:string;route:Point[];moving:boolean;phase:number;pending:Pending|null;gesture:number;distance:number;segment:Segment|null}\nconst maps:Record<string,Geometry>=Object.fromEntries(Object.entries(prologWorld.rooms).map(([id,r])=>[id,r.geometry]));\n` +
    m +
    `\nexport const Movement={maps,walkable,path,clear,scale,create,cancel,move,tick};\n`,
);
console.log('ESM shell and TypeScript movement port created.');
