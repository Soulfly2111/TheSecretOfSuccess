'use strict';
const PixelScene=(()=>{
 const backgrounds=new Image(),hero=new Image(),mechanicImage=new Image();backgrounds.src='assets/locations-v3.png';hero.src='assets/hero-detailed-v6.png';mechanicImage.src='assets/mechanic-idle.png';
 const doorsOpen=new Image();doorsOpen.src='assets/doors-open-v5.png';
 const changed=new Image();changed.src='assets/locations-states-v3.png';
 const carClosed=new Image(),carOpen=new Image();carClosed.src='assets/car-front-closed-v4.png';carOpen.src='assets/car-front-open-v4.png';
 const tiles=[],mechanicTiles=[],dirs={right:0,left:1,down:2,up:3};let talkingUntil=0;
 const slots={yard:[0,0],garage:[1,0],barn:[0,1],house:[1,1]};
 function patch(ctx,room,rect,source=changed){
  if(!source.complete||!source.naturalWidth)return;
  const [qx,qy]=slots[room],w=source.width/2,h=source.height/2,[left,top,right,bottom]=rect;
  const x=Math.floor(left*640/100),y=Math.floor(top*360/100),xx=Math.ceil(right*640/100),yy=Math.ceil(bottom*360/100);
  // Align source and destination through the same scene grid to avoid subpixel seams.
  ctx.drawImage(source,qx*w+x/640*w,qy*h+y/360*h,(xx-x)/640*w,(yy-y)/360*h,x,y,xx-x,yy-y);
 }
 function objectStates(ctx,state){
  const s=SceneState.objects(state);
  if(state.room==='house'){
   if(!s.manual)patch(ctx,'house',[15,59,34,73]);
   if(!s.key)patch(ctx,'house',[69,26,74,39]);
   if(!s.cup)patch(ctx,'house',[62,47,68,58]);
   if(s.cupboardOpen){
    // Use the original cabinet's right-hand hinge and matching perspective.
    patch(ctx,'house',[60,58,74,84],doorsOpen);
    if(s.grounds){ctx.fillStyle='#41291e';ctx.fillRect(402,236,19,16);ctx.fillStyle='#845039';ctx.fillRect(403,236,17,15);ctx.fillStyle='#c6a474';ctx.fillRect(402,234,19,3);ctx.fillStyle='#e3c889';ctx.fillRect(405,241,13,7);ctx.fillStyle='#624030';ctx.fillRect(409,243,5,3);}
   }
   if(s.coffeeReady){ctx.fillStyle='#eee0b480';const drift=Math.floor(performance.now()/450)%3;ctx.fillRect(325+drift,151,2,7);ctx.fillRect(329-drift,140,2,6);}

  }
  if(state.room==='garage'){
   if(!s.rag)patch(ctx,'garage',[23,49,35,71]);
   if(s.toolboxOpen){patch(ctx,'garage',[8,42,20,58]);
    if(s.wrenchInBox){ctx.save();ctx.translate(88,193);ctx.rotate(-.14);ctx.fillStyle='#34444f';ctx.fillRect(-9,-2,22,5);ctx.fillStyle='#b4c4c5';ctx.fillRect(-8,-1,20,2);ctx.fillRect(-11,-3,4,6);ctx.fillRect(-10,-2,2,4);ctx.fillStyle='#35434c';ctx.fillRect(-12,-1,4,2);ctx.restore();}
   }
  }
  if(state.room==='barn'){
   if(s.chestOpen)patch(ctx,'barn',[36,45,55,78]);
   if(!s.tractorBelt)patch(ctx,'barn',[58,43,68,66]);
  }
  if(state.room==='yard'){
   patch(ctx,'yard',[52,47,86,90],s.hoodOpen?carOpen:carClosed);
   patch(ctx,'yard',[86,44,97,69],doorsOpen);
  }
 }
 function slice(image,columns,rows,output,rowCuts=null){const c=document.createElement('canvas');c.width=image.width;c.height=image.height;let g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data,tw=c.width/columns,th=c.height/rows;
  for(let row=0;row<rows;row++)for(let col=0;col<columns;col++){let left=Math.ceil(col*tw),top=rowCuts?rowCuts[row]:Math.ceil(row*th),right=Math.floor((col+1)*tw)-1,bottom=(rowCuts?rowCuts[row+1]:Math.floor((row+1)*th))-1,minX=right,maxX=left,minY=bottom,maxY=top;
   for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){if(pixels[(y*c.width+x)*4+3]>100){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
   let hipY=Math.round(minY+(maxY-minY)*(image===hero?.48:.74)),hipL=maxX,hipR=minX;
   for(let x=minX;x<=maxX;x++)if(pixels[(hipY*c.width+x)*4+3]>100){hipL=Math.min(hipL,x);hipR=Math.max(hipR,x);}
   output.push({x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,anchor:(hipL+hipR)/2-minX});
  }
 }
 hero.onload=()=>slice(hero,5,4,tiles,[0,283,559,829,1122]);mechanicImage.onload=()=>slice(mechanicImage,2,2,mechanicTiles);
 function background(ctx,room){if(!backgrounds.complete||!backgrounds.naturalWidth)return;const slots={yard:[0,0],garage:[1,0],barn:[0,1],house:[1,1]},[x,y]=slots[room],w=backgrounds.width/2,h=backgrounds.height/2;ctx.imageSmoothingEnabled=false;ctx.drawImage(backgrounds,x*w,y*h,w,h,0,0,640,360);}
 function actor(ctx,a,room,t,mechanic=false){const factor=Movement.scale(room,a.y),h=Math.round(72*factor*2/3),x=Math.round(a.x*2/3),y=Math.round(a.y*2/3);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#11152266';ctx.fillRect(x-Math.round(h*.12),y,Math.round(h*.27),2);
  if(mechanic&&mechanicTiles.length===4){let frame=t<talkingUntil?2+Math.floor(t/420)%2:(Math.floor(t/160)%24===0?1:0),tile=mechanicTiles[frame],w=Math.round(h*tile.w/tile.h);ctx.drawImage(mechanicImage,tile.x,tile.y,tile.w,tile.h,x-Math.round(tile.anchor/tile.h*h),y-h,w,h);return;}
  if(tiles.length===20&&!mechanic){
   // Each direction has one complete standing pose and four complete walk frames.
   // Never cut, mirror or replace legs independently of the jacket and pelvis.
   const frame=a.moving?1+Math.floor(a.phase/125)%4:0;
   const tile=tiles[dirs[a.direction]*5+frame],w=Math.round(h*tile.w/tile.h);
   const left=x-Math.round(tile.anchor/tile.h*h);
   ctx.drawImage(hero,tile.x,tile.y,tile.w,tile.h,left,y-h,w,h);
   return;
  }
  if(!mechanic)return;
  // A separate low-resolution mechanic with a cap, overalls and idle gestures.
  ctx.save();ctx.translate(x,y);ctx.scale(factor*2/3,factor*2/3);const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)},breathe=Math.floor(t/800)%2;
  r(-8,-3,9,3,'#151925');r(3,-3,10,3,'#151925');r(-7,-28,7,26,'#263e56');r(3,-28,7,26,'#33536c');r(-7,-28,3,24,'#476981');r(-11,-49,23,24,'#456c83');r(-7,-48,13,11,'#8a9c9b');r(-7,-44,3,16,'#2f536f');r(6,-44,3,16,'#2f536f');r(-6,-34,13,10,'#315774');r(-13,-46,5,22+breathe,'#315570');r(10,-46,5,21-breathe,'#547b8c');r(-13,-25+breathe,5,6,'#b98961');r(10,-26-breathe,5,6,'#d1a176');r(-5,-56,11,8,'#ae7957');r(-8,-67,16,13,'#d0a278');r(-9,-64,3,8,'#916947');r(6,-64,3,8,'#e2b18a');r(-8,-72,15,6,'#536b7a');r(-11,-67,22,3,'#73909a');r(-6,-60,3,2,'#242f3a');r(3,-60,3,2,'#242f3a');r(-4,-55,11,3,'#aaa69a');r(0,-54,5,1,'#795343');ctx.restore();
 }
 function render(ctx,state,a,t){ctx.clearRect(0,0,640,360);background(ctx,state.room);objectStates(ctx,state);if(state.room==='garage'){let p=Movement.maps.garage.npc,npc={x:p[0],y:p[1],direction:'left',moving:false};if(a.y<npc.y){actor(ctx,a,state.room,t);actor(ctx,npc,state.room,t,true);}else{actor(ctx,npc,state.room,t,true);actor(ctx,a,state.room,t);}}else actor(ctx,a,state.room,t);

 }
 return {render,drawActor:actor,talk:()=>{talkingUntil=performance.now()+6500;}};
})();

