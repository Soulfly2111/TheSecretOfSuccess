const assert=require('node:assert/strict');
const M=require('./movement.js');
for(const [room,map] of Object.entries(M.maps)){
 for(const [id,spot] of Object.entries(map.spots)){
  const actor=M.create(room);let arrived=null;const command={target:id,facing:spot[2]};
  assert(M.walkable(room,actor),`${room} spawn is on floor`);
  assert(M.walkable(room,{x:spot[0],y:spot[1]}),`${room}/${id} interaction point is on floor`);
  assert(M.move(actor,room,{x:spot[0],y:spot[1]},command),`${room}/${id} reachable`);
  assert.equal(arrived,null,'no immediate interaction');
  for(let i=0;i<2000&&!arrived;i++){arrived=M.tick(actor,16,room);assert(M.walkable(room,actor),`${room}/${id} path never crosses scenery`);}
  assert.equal(arrived,command,`${room}/${id} action executes on arrival`);
  assert(Math.hypot(actor.x-spot[0],actor.y-spot[1])<1);
  assert.equal(actor.direction,spot[2]);assert.equal(M.tick(actor,16,room),null,'action runs once');
 }
 // Every pair must be connected, not just paths from the entrance.
 const points=Object.values(map.spots);
 for(const p of points)for(const q of points){const route=M.path(room,{x:p[0],y:p[1]},{x:q[0],y:q[1]});assert(route.length,`${room} all objects connected`);}
 assert(M.scale(room,map.minY)<M.scale(room,map.maxY),'perspective scales towards foreground');
}
let a=M.create('yard');M.move(a,'yard',{x:139,y:337},{target:'house'});M.cancel(a);assert.equal(M.tick(a,20,'yard'),null);assert.equal(a.pending,null);
M.move(a,'yard',{x:139,y:337},{target:'old'});M.move(a,'yard',{x:474,y:335},{target:'new'});let result;for(let i=0;i<1000&&!result;i++)result=M.tick(a,16,'yard');assert.equal(result.target,'new');
console.log('PASS: every object reachable, connected floor paths, obstacle avoidance, arrival-only actions, cancellation, replacement commands, perspective scale.');
for(const [dir,from,to] of [['up',[350,460],[350,360]],['down',[350,360],[350,460]],['left',[450,460],[350,460]],['right',[350,460],[450,460]]]){let p=M.create('yard');[p.x,p.y]=from;M.move(p,'yard',{x:to[0],y:to[1]});M.tick(p,16,'yard');assert.equal(p.direction,dir);}
console.log('PASS: directional animation selection for up, down, left and right.');
for(const [x,y] of [[699,420],[612,430],[520,440],[440,480]]){
 assert.equal(M.walkable('house',{x,y}),false,'cabinet/table footprint cannot be entered');
 const p=M.create('house');M.move(p,'house',{x,y});for(let i=0;i<2000&&p.moving;i++){M.tick(p,16,'house');assert(M.walkable('house',p));}
 assert(p.y>=446&&M.walkable('house',p),'click on furniture clamps to a safe floor point');
}
console.log('PASS: house cabinet, stove and table clicks stay on the floor with body clearance.');
