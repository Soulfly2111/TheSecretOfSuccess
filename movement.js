(function(root){
'use strict';
// Geometry uses world coordinates; rooms may be wider than the 960 × 540 viewport.
const maps={
 yard:{floor:[[60,328],[280,310],[560,321],[930,344],[936,493],[835,512],[250,512],[62,485]],obstacles:[[520,330,803,470],[0,370,184,450]],spawn:[345,469],minY:320,maxY:510,minScale:1.45,maxScale:1.95,spots:{house:[139,337,'up'],barn:[474,335,'up'],garage:[877,369,'up'],car:[492,474,'right'],well:[210,468,'left']},entries:{house:[144,349],barn:[474,347],garage:[875,384]}},
 garage:{floor:[[60,465],[445,455],[560,434],[931,425],[932,505],[52,505]],obstacles:[[681,436,725,468],[453,435,512,461]],spawn:[877,458],minY:430,maxY:505,minScale:3.1,maxScale:3.45,spots:{toolbox:[176,478,'up'],rag:[316,476,'up'],mechanic:[588,475,'right'],yard:[910,437,'right']},npc:[703,451]},
 barn:{floor:[[212,425],[511,420],[741,425],[932,395],[935,505],[95,505],[96,463]],obstacles:[],spawn:[891,445],minY:415,maxY:505,minScale:2.85,maxScale:3.2,spots:{hay:[233,455,'left'],chest:[447,454,'up'],tractor:[662,450,'up'],yard:[913,419,'right']}},
 house:{floor:[[464,466],[791,466],[832,446],[907,446],[913,510],[464,510]],obstacles:[[480,0,788,449],[400,0,530,435],[0,330,430,540],[940,0,960,540]],clearance:[26,12],spawn:[877,485],minY:450,maxY:510,minScale:3.25,maxScale:3.65,spots:{manual:[480,491,'left'],key:[699,477,'up'],cup:[612,477,'up'],pot:[552,477,'up'],stove:[552,477,'up'],cupboard:[650,477,'up'],grounds:[650,477,'up'],yard:[871,466,'right']}}
};
function inside(point,polygon){let hit=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [x,y]=polygon[i],[xx,yy]=polygon[j];if((y>point.y)!==(yy>point.y)&&point.x<(xx-x)*(point.y-y)/(yy-y)+x)hit=!hit;}return hit;}
function walkable(room,p){const m=maps[room],[rx,ry]=m.clearance||[9,5];return inside(p,m.floor)&&!m.obstacles.some(([x,y,xx,yy])=>p.x>x-rx&&p.x<xx+rx&&p.y>y-ry&&p.y<yy+ry);}
const grid=12,cache={};
function nodes(room){if(cache[room])return cache[room];const m=maps[room],points=[];for(let y=300;y<516;y+=grid)for(let x=36;x<(m.width||960)-12;x+=grid)if(walkable(room,{x,y}))points.push({x,y});return cache[room]=points;}
function nearest(room,p){return nodes(room).reduce((best,v)=>Math.hypot(v.x-p.x,v.y-p.y)<Math.hypot(best.x-p.x,best.y-p.y)?v:best);}
function clear(room,a,b){const n=Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/4);for(let i=0;i<=n;i++){const q=n?i/n:0;if(!walkable(room,{x:a.x+(b.x-a.x)*q,y:a.y+(b.y-a.y)*q}))return false;}return true;}
function path(room,from,to){const start=walkable(room,from)?from:nearest(room,from),end=walkable(room,to)?to:nearest(room,to);if(clear(room,start,end))return [end];const list=nodes(room),a=nearest(room,start),b=nearest(room,end),key=p=>p.x+','+p.y,lookup=new Map(list.map(p=>[key(p),p]));let open=[a],came=new Map(),g=new Map([[key(a),0]]),closed=new Set();while(open.length){open.sort((x,y)=>(g.get(key(x))+Math.hypot(x.x-b.x,x.y-b.y))-(g.get(key(y))+Math.hypot(y.x-b.x,y.y-b.y)));let cur=open.shift(),k=key(cur);if(k===key(b)){let route=[end,cur];while(came.has(key(cur))){cur=came.get(key(cur));route.push(cur);}route.reverse();route.unshift(start);let result=[],i=0;while(i<route.length-1){let j=route.length-1;while(j>i+1&&!clear(room,route[i],route[j]))j--;result.push(route[j]);i=j;}return result;}closed.add(k);for(let dx=-grid;dx<=grid;dx+=grid)for(let dy=-grid;dy<=grid;dy+=grid){if(!dx&&!dy)continue;const next=lookup.get((cur.x+dx)+','+(cur.y+dy));if(!next||closed.has(key(next))||!clear(room,cur,next))continue;const cost=g.get(k)+Math.hypot(dx,dy);if(cost<(g.get(key(next))??Infinity)){came.set(key(next),cur);g.set(key(next),cost);if(!open.includes(next))open.push(next);}}}return [];}
function scale(room,y){let m=maps[room],t=Math.max(0,Math.min(1,(y-m.minY)/(m.maxY-m.minY)));return m.minScale+(m.maxScale-m.minScale)*t;}
function create(room){let m=maps[room];return {x:m.spawn[0],y:m.spawn[1],direction:'down',route:[],moving:false,phase:0,pending:null,gesture:0};}
function cancel(actor){actor.route=[];actor.pending=null;actor.moving=false;actor.gesture=0;}
function move(actor,room,point,pending=null){actor.route=path(room,actor,point);actor.pending=actor.route.length?pending:null;actor.moving=actor.route.length>0;return actor.moving;}
function tick(actor,dt,room){dt=Math.min(dt,50);actor.gesture=Math.max(0,actor.gesture-dt);if(!actor.route.length){actor.moving=false;return null;}let goal=actor.route[0],dx=goal.x-actor.x,dy=goal.y-actor.y,d=Math.hypot(dx,dy),step=dt*.205*(scale(room,actor.y)/1.8);actor.direction=Math.abs(dx)>Math.abs(dy)*1.25?(dx>0?'right':'left'):(dy>0?'down':'up');actor.phase+=dt;if(d<=step){actor.x=goal.x;actor.y=goal.y;actor.route.shift();if(!actor.route.length){actor.moving=false;let action=actor.pending;actor.pending=null;if(action?.facing)actor.direction=action.facing;return action;}}else{actor.x+=dx/d*step;actor.y+=dy/d*step;}return null;}
const api={maps,walkable,path,clear,scale,create,cancel,move,tick};if(typeof module!=='undefined')module.exports=api;else root.Movement=api;
})(typeof window!=='undefined'?window:globalThis);




