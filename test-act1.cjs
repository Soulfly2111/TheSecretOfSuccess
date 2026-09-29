const assert=require('node:assert/strict');
const Act=require('./act1-engine'),Movement=require('./movement'),World=require('./act1-world');
World.install(Movement);
const roomIds=Object.keys(World.rooms);
assert.equal(roomIds.length,10);
assert.deepEqual(Object.keys(Act.items),['smartphone','selfie','marble','vipBadge','brochure','knife','keycard']);
for(const room of roomIds){
 const state=Act.fresh();state.room=room;
 assert.equal(Act.canEnter(state,room),'');
 for(const object of World.rooms[room].objects){
  for(const verb of ['Schau an','Rede mit','Nimm','Benutze','Wähle'])assert.equal(typeof Act.act(state,verb,object[0]),'string');
  assert(state.inventory.every(item=>Act.items[item]));
  assert.equal(state.room,room);
  assert(!state.won);
 }
 for(const destination of roomIds){
  const route=World.route(room,destination);
  assert.equal(route.length===0,room===destination);
  if(route.length)assert.equal(route.at(-1).to,destination);
  let current=room;
  for(const edge of route){assert(World.connections[current].includes(edge));assert(World.connections[edge.to].some(back=>back.to===current));current=edge.to;}
 }
 for(const edge of World.connections[room]){
  const point=World.entry(edge);assert(Movement.walkable(edge.to,{x:point[0],y:point[1]}),'entry '+room+' '+edge.target);
 }
 for(const [target,point] of Object.entries(Movement.maps[room].spots)){
  assert(Movement.walkable(room,{x:point[0],y:point[1]}),room+' '+target+' is walkable');
  const actor=Movement.create(room);
  assert(Movement.move(actor,room,{x:point[0],y:point[1]},{target}),room+' '+target+' is connected');
  let action=null;
  for(let tick=0;tick<2000&&!action;tick++){action=Movement.tick(actor,50,room);assert(Movement.walkable(room,actor));}
  assert.equal(action?.target,target);assert.equal(actor.x,point[0]);assert.equal(actor.y,point[1]);
  assert.equal(Movement.tick(actor,50,room),null);
 }
}
for(const room of ['lobby','upper','second']){
 assert.equal(World.cameraX(room,0),0);assert.equal(World.cameraX(room,1000),520);assert.equal(World.cameraX(room,2000),960);
 assert.notDeepEqual(World.entry(World.connection(room,'stairs')),World.entry(World.connection(room,'elevator')));
 const actor=Movement.create(room);Movement.move(actor,room,{x:1800,y:480},{target:'cancel'});Movement.cancel(actor);
 assert.equal(Movement.tick(actor,50,room),null);
}
for(const [room,point] of [['lobby',{x:490,y:385}],['upper',{x:350,y:350}],['upper',{x:1600,y:350}],['kitchen',{x:500,y:340}],['kitchen',{x:850,y:390}],['restroom',{x:500,y:480}]])assert(!Movement.walkable(room,point),'blocked furniture '+room);
for(const [room,point] of [['upper',{x:500,y:360}],['upper',{x:1810,y:365}]])assert(Movement.path(room,Movement.create(room),point).length,'accessible alcove');
const state=Act.fresh();Act.act(state,'Nimm','brochureStand');Act.act(state,'Nimm','brochureStand');
assert.deepEqual(state.inventory.filter(id=>id!=='smartphone'),['brochure']);assert.equal(state.journal.length,1);assert.match(Act.act(state,'Schau an','brochure'),/Black Hole/);
for(const target of Object.keys(Act.doorFlags)){assert(!Act.walkExit(Act.fresh(),target));Act.act(state,'Öffne',target);assert(Act.walkExit(state,target));Act.act(state,'Schließe',target);assert(!Act.walkExit(state,target));}
const legacy={room:'corridor',inventory:['badge','brochure','techKey'],flags:{repaired:true,technicalOpen:true},journal:['old puzzle']};
const snapshot=JSON.stringify(legacy),migrated=Act.restore(null,legacy,roomIds);
assert.equal(migrated.room,'corridor');assert.deepEqual(migrated.inventory.filter(id=>id!=='smartphone'),['brochure']);assert(!migrated.flags.repaired);assert.equal(JSON.stringify(legacy),snapshot);
for(const room of ['ending','missing','lodge','vestibule'])assert.equal(Act.restore(null,{...legacy,room},roomIds).room,'lobby');
assert.equal(Act.restore(null,{...legacy,won:true},roomIds).room,'lobby');
assert.deepEqual(Act.restore({room:'kitchen',inventory:[],flags:{kitchenOpen:true}},legacy,roomIds).inventory,['smartphone']);
assert.equal(Act.restore({room:'kitchen',inventory:[],flags:{}},null,roomIds).room,'kitchen');
assert.deepEqual(Act.restore(null,{flags:{brochureTaken:true}},roomIds).inventory,['brochure','smartphone']);
assert.notEqual(Act.saveKey,Act.legacyKey);
console.log('PASS: all routes and reachable interaction points, arrival-only actions, furniture collision, camera, quest items, unlocked exploration and non-destructive save migration.');
for(const origin of World.floors){
 assert.equal(World.liftOptions(origin).filter(option=>option.current).length,1);
 for(const destination of World.floors.filter(id=>id!==origin)){
  const edge=World.connection(origin,'elevator',destination);
  assert.equal(edge.to,destination);assert.equal(edge.kind,'elevator');
  assert.deepEqual(World.entry(edge),World.entries[destination].elevator);
 }
}
assert.equal(World.connection('upper','stairs').to,'lobby');
assert.equal(World.connection('upper','stairsUp').to,'second');
assert.equal(World.connection('second','stairs').to,'upper');
assert(!World.connection('second','stairsUp'));
assert.notDeepEqual(World.entry(World.connection('lobby','stairs')),World.entry(World.connection('second','stairs')));
for(const room of ['second','teamOffice','ems','lounge']){
 const saved={...Act.fresh(),room,inventory:['brochure'],flags:{brochureTaken:true,officeOpen:true,emsOpen:true,loungeOpen:true}};
 const restored=Act.restore(saved,null,roomIds);
 assert.equal(restored.room,room);assert.deepEqual(restored.inventory.filter(id=>id!=='smartphone'),['brochure']);
 assert(restored.flags.officeOpen&&restored.flags.emsOpen&&restored.flags.loungeOpen);
}
for(const [room,point] of [['second',{x:420,y:335}],['teamOffice',{x:550,y:320}],['ems',{x:666,y:280}],['lounge',{x:500,y:310}]])assert(!Movement.walkable(room,point),'new furniture '+room);
assert(Movement.walkable('ems',{x:500,y:316}),'training mat is walkable');
console.log('PASS: three-floor elevator choices, separate stair directions, four new rooms, door persistence and furniture.');
