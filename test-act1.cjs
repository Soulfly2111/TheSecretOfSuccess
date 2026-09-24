const assert=require('node:assert/strict'),A=require('./act1-engine'),M=require('./movement'),W=require('./act1-world');
W.install(M);
let s=A.fresh();const doAct=(v,t,i)=>{const message=A.act(s,v,t,i);assert.equal(typeof message,'string');s=JSON.parse(JSON.stringify(s));return message;};
assert.equal(A.canEnter(s,'lobby'),'');assert(A.canEnter(s,'corridor'));
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

// The floor is continuous, while doors are the only transitions out of the panorama.
assert.equal(W.rooms.lobby.width,1920);
assert.equal(W.cameraX('lobby',180),0);
assert.equal(W.cameraX('lobby',1000),520);
assert.equal(W.cameraX('lobby',1860),960);
assert.equal(W.cameraX('delivery',865),0);
assert.equal(W.migrate({room:'lodge'}).room,'lobby');
assert.equal(W.migrate({room:'vestibule'}).room,'lobby');
assert.equal(W.exitTarget('lobby','delivery'),'sideDoor');
assert.equal(W.exitTarget('lobby','corridor'),'techDoor');
assert.equal(W.nextRoom('delivery','corridor'),'lobby');
const walker=M.create('lobby');
assert(!M.walkable('lobby',{x:490,y:385}),'Reception desk is not walkable');
assert(M.move(walker,'lobby',{x:1840,y:480},{target:'across'}));
let done=null;for(let n=0;n<2000&&!done;n++)done=M.tick(walker,50,'lobby');
assert.equal(done.target,'across');assert(walker.x>1800);
// A click on the far-right wall must project to the right-hand floor, never the old viewport limit.
assert(M.move(walker,'lobby',{x:1820,y:150}));
assert(walker.route.at(-1).x>1750);
console.log('PASS: panoramic floor, camera clamps, door topology, legacy save migration and wide-room pathfinding.');
const objects=W.rooms.lobby.objects;
const reader=objects.find(o=>o[0]==='reader'),door=objects.find(o=>o[0]==='techDoor');
assert(reader[2]+reader[4]<door[2]);
console.log('PASS: reader hotspot does not overlap technical door.');

const doors=A.fresh();
assert(!A.walkExit(doors,'sideDoor'));assert(!A.walkExit(doors,'techDoor'));
doors.flags.sideOpen=true;assert(A.walkExit(doors,'sideDoor'));
doors.flags.technicalOpen=true;assert(A.walkExit(doors,'techDoor'));
assert(!A.walkExit(doors,'elevator'));assert(!A.walkExit(doors,'keyboard'));
doors.room='delivery';assert(A.walkExit(doors,'lobbyExit'));assert(!A.walkExit(doors,'techDoor'));
doors.room='corridor';assert(A.walkExit(doors,'lobbyExit'));
console.log('PASS: only open accessible door exits automatically select walking.');
