const assert=require('node:assert/strict'),A=require('./act1-engine'),M=require('./movement'),W=require('./act1-world');
W.install(M);
let s=A.fresh();const doAct=(v,t,i)=>{const message=A.act(s,v,t,i);assert.equal(typeof message,'string');s=JSON.parse(JSON.stringify(s));return message;};
assert(A.canEnter(s,'lodge'));assert(A.canEnter(s,'corridor'));
doAct('Wähle','callSeidelJob');assert(!s.flags.employment);
doAct('Benutze','keybook');doAct('Wähle','keyCorrect');assert(!s.inventory.includes('techKey'));
doAct('Wähle','repair');doAct('Benutze','freight');assert(!s.flags.repaired&&!s.won);
doAct('Schau an','invitation');doAct('Öffne','sideDoor');assert.equal(A.canEnter(s,'lodge'),'');
doAct('Wähle','callSeidelJob');doAct('Rede mit','walter');assert(s.inventory.includes('badge'));
doAct('Wähle','handover');assert(A.visible(s,'visitor'));assert(!A.visible(s,'salesman'));
doAct('Wähle','callBergerLaw');doAct('Wähle','callBergerSales');assert(!s.flags.visitorConfirmed);
doAct('Wähle','callBergerIT');assert(!s.flags.visitorConfirmed);
doAct('Wähle','visitorReason');doAct('Wähle','visitorDept');doAct('Schau an','schedule');doAct('Schau an','directory');doAct('Wähle','callBergerIT');
doAct('Nimm','badges');doAct('Gib','visitor','visitorBadge');assert(s.flags.visitorDone);assert(!A.visible(s,'visitor'));assert(!A.visible(s,'walter'));assert(A.visible(s,'salesman'));
doAct('Wähle','rejectSeller');assert(!s.flags.sellerRejected);doAct('Wähle','callSeidelSeller');doAct('Wähle','rejectSeller');assert(!A.visible(s,'salesman'));
doAct('Rede mit','technician');doAct('Wähle','callMaintenance');assert(!s.flags.serviceConfirmed);doAct('Schau an','order');doAct('Schau an','maintenance');doAct('Wähle','callMaintenance');doAct('Nimm','badges');doAct('Gib','technician','serviceBadge');assert(s.flags.techAdmitted);
doAct('Wähle','moveDelivery');assert(!s.flags.accessClear);doAct('Nimm','mats');assert(!s.inventory.includes('mats'));doAct('Schau an','deliveryNote');doAct('Wähle','callSeidelDelivery');doAct('Nimm','mats');doAct('Benutze','elevator','mats');assert(!s.inventory.includes('mats'));doAct('Wähle','moveDelivery');assert(s.flags.accessClear);assert(!A.visible(s,'bust'));
doAct('Wähle','helpMara');assert(s.flags.maraHelped&&!A.visible(s,'mara'));
doAct('Benutze','reader','badge');doAct('Schau an','notice');doAct('Benutze','keybook');doAct('Wähle','keyWrong');assert(!s.inventory.includes('techKey'));doAct('Wähle','keyCorrect');doAct('Benutze','techDoor','techKey');assert(!s.inventory.includes('techKey'));assert.equal(A.canEnter(s,'corridor'),'');
s.room='corridor';doAct('Rede mit','technician');assert(s.flags.repaired);assert(A.visible(s,'walter'));assert(A.visible(s,'uncle'));
s.room='lobby';doAct('Rede mit','uncle');doAct('Rede mit','walter');assert(s.flags.audited);doAct('Rede mit','rita');s.room='corridor';doAct('Benutze','freight');assert(s.won);assert.equal(s.room,'ending');assert(s.journal.length>=15);
// Every new interaction point is connected and actions execute only after arrival.
for(const [room,data] of Object.entries(W.rooms)){
 for(const [id,p] of Object.entries(M.maps[room].spots)){
  const actor=M.create(room);assert(M.walkable(room,{x:p[0],y:p[1]}),room+' '+id);
  assert(M.move(actor,room,{x:p[0],y:p[1]},{target:id}));assert(actor.pending);let action=null;for(let n=0;n<2000&&!action;n++)action=M.tick(actor,50,room);assert.equal(action?.target,id);assert.equal(M.tick(actor,50,room),null);
 }
}
console.log('PASS: Act 1 complete path, wrong calls/keys, prerequisite gates, consumed items, NPC states, journal/save roundtrips and all arrival-only interactions.');
