const assert=require('node:assert/strict');
const {fresh,act,hint}=require('./engine.js');
let s=fresh();
act(s,'Mach an','car');assert.equal(s.won,false);
act(s,'Nimm','toolbox');assert.equal(s.inventory.length,0);
require('./test-coffee.cjs').brew(s);act(s,'Gib','mechanic','coffee');act(s,'Öffne','toolbox');act(s,'Nimm','toolbox');assert(s.inventory.includes('wrench'));
act(s,'Nimm','key');act(s,'Benutze','car','key');assert.equal(s.won,false);
act(s,'Benutze','tractor','wrench');assert(s.inventory.includes('dirtybelt'));
act(s,'Öffne','car');act(s,'Benutze','car','wrench');assert(!s.flags.tight);
act(s,'Schau an','manual');act(s,'Benutze','car','dirtybelt');assert(!s.flags.belt);
act(s,'Nimm','rag');act(s,'Benutze','dirtybelt','rag');assert(s.inventory.includes('belt'));assert(!s.inventory.includes('dirtybelt'));
act(s,'Benutze','car','belt');assert(s.flags.belt);act(s,'Benutze','car','key');assert.equal(s.won,false);
act(s,'Benutze','car','wrench');assert(s.flags.tight);act(s,'Schließe','car');act(s,'Benutze','car','key');assert(s.won);
s=fresh();require('./test-coffee.cjs').brew(s);act(s,'Gib','mechanic','coffee');assert(s.flags.coffeeGiven);assert(!s.inventory.includes('coffee'));assert(hint(s).includes('Reparaturhandbuch'));
console.log('PASS: full puzzle path, premature start, manual requirement, dirty belt, closed toolbox, coffee dialogue.');

