const assert=require('node:assert/strict'),A=require('./engine.js'),V=require('./scene-state.js');
function brew(s){
 A.act(s,'Nimm','cup');A.act(s,'Benutze','well','cup');
 A.act(s,'Benutze','pot','water');A.act(s,'Öffne','cupboard');
 A.act(s,'Nimm','grounds');A.act(s,'Benutze','pot','grounds');
 A.act(s,'Mach an','stove');A.act(s,'Benutze','pot','cup');
}
module.exports={brew};
let s=A.fresh();
A.act(s,'Öffne','toolbox');A.act(s,'Nimm','toolbox');assert(!s.inventory.includes('wrench'));
A.act(s,'Nimm','coffee');assert(!s.inventory.includes('coffee'));
A.act(s,'Nimm','grounds');assert(!s.inventory.includes('grounds'));
A.act(s,'Mach an','stove');assert(!s.flags.brewed);
A.act(s,'Nimm','cup');A.act(s,'Benutze','pot','cup');assert(!s.inventory.includes('coffee'));
A.act(s,'Benutze','well','cup');assert(s.inventory.includes('water'));assert(!V.objects(s).cup);
A.act(s,'Gib','mechanic','water');assert(!s.flags.coffeeGiven);
A.act(s,'Benutze','pot','water');A.act(s,'Mach an','stove');assert(!s.flags.brewed);
A.act(s,'Öffne','cupboard');assert(V.objects(s).grounds);
A.act(s,'Nimm','grounds');assert(!V.objects(s).grounds);
A.act(s,'Schließe','cupboard');A.act(s,'Öffne','cupboard');assert(!V.objects(s).grounds);
A.act(s,'Benutze','pot','grounds');A.act(s,'Mach an','stove');assert(V.objects(s).coffeeReady);
A.act(s,'Benutze','pot','cup');assert(s.inventory.includes('coffee'));assert(!V.objects(s).coffeeReady);
A.act(s,'Nimm','toolbox');assert(!s.inventory.includes('wrench'),'brewing alone does not unlock tool');
s=JSON.parse(JSON.stringify(s));A.act(s,'Gib','mechanic','coffee');A.act(s,'Nimm','toolbox');assert(s.inventory.includes('wrench'));
A.act(s,'Nimm','toolbox');assert.equal(s.inventory.filter(x=>x==='wrench').length,1);
A.act(s,'Nimm','cup');A.act(s,'Nimm','grounds');assert(!s.inventory.includes('cup'));assert(!s.inventory.includes('grounds'));
console.log('PASS: coffee prerequisites, ingredient consumption, visual states, saved progress and tool gate.');
