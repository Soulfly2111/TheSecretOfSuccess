const assert=require('node:assert/strict'),A=require('./engine.js'),V=require('./scene-state.js');
let s=A.fresh();for(const id of ['manual','key','rag','cup']){assert.equal(V.objects(s)[id],true);A.act(s,'Nimm',id);assert.equal(V.objects(s)[id],false,`${id} disappears after pickup`);}
require('./test-coffee.cjs').brew(s);A.act(s,'Gib','mechanic','coffee');assert(!s.inventory.includes('coffee'));assert.equal(V.objects(s).coffee,false,'given coffee stays absent');
A.act(s,'Öffne','toolbox');assert(V.objects(s).toolboxOpen);assert(V.objects(s).wrenchInBox);A.act(s,'Nimm','toolbox');assert(!V.objects(s).wrenchInBox);A.act(s,'Schließe','toolbox');assert(!V.objects(s).toolboxOpen);
A.act(s,'Öffne','toolbox');assert(!V.objects(s).wrenchInBox,'reopening cannot respawn taken tool');
for(const [id,flag] of [['chest','chestOpen'],['car','hoodOpen']]){A.act(s,'Öffne',id);assert(V.objects(s)[flag]);A.act(s,'Schließe',id);assert(!V.objects(s)[flag]);}
A.act(s,'Benutze','tractor','wrench');assert(!V.objects(s).tractorBelt);assert.deepEqual(V.objects(JSON.parse(JSON.stringify(s))),V.objects(s),'visual state survives save/reload');
console.log('PASS: pickups disappear, gifted item stays absent, containers/hood open and close, taken wrench/belt do not reappear, persisted visual states.');
