'use strict';
const ActOneScene=(()=>{
 const brochure=new Image();brochure.src='assets/company-brochure-v1.png';
 const restroom=new Image(),wcDoor=new Image();restroom.src='assets/act1-wc-v1.png';wcDoor.src='assets/act1-ground-wc-open-v1.png';
 const panorama=new Image(),opened=new Image();panorama.src='assets/act1-ground-floor-v2.png';opened.src='assets/act1-ground-floor-open-v2.png';
 const backgrounds=new Image(),people=new Image(),bust=new Image(),tiles=[];bust.src='assets/act1-delivery-bust.png';backgrounds.src='assets/act1-locations.png';people.src='assets/act1-characters.png';
 people.onload=()=>{const c=document.createElement('canvas');c.width=people.width;c.height=people.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(people,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data,w=c.width/3,h=c.height/3;
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){let left=Math.ceil(col*w),right=Math.floor((col+1)*w)-1,top=[0,418,833][row],bottom=[418,833,1254][row]-1,x=right,y=bottom,xx=left,yy=top;for(let j=top;j<=bottom;j++)for(let i=left;i<=right;i++)if(pixels[(j*c.width+i)*4+3]>110){x=Math.min(x,i);xx=Math.max(xx,i);y=Math.min(y,j);yy=Math.max(yy,j);}tiles.push({x,y,w:xx-x+1,h:yy-y+1});}
 };
 function npc(ctx,id,x,y,t,room='lobby'){const data=ActOneWorld.npcs[id],tile=tiles[data[0]];if(!tile)return;let h=Math.round(72*Movement.scale(room,y)*2/3),w=Math.round(h*tile.w/tile.h);ctx.drawImage(people,tile.x,tile.y,tile.w,tile.h,Math.round(x*2/3-w/2),Math.round(y*2/3-h),w,h);}
 function render(ctx,s,a,t,camera=0){ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,640,360);const tile=ActOneWorld.rooms[s.room].tile;ctx.save();ctx.translate(-Math.round(camera*2/3),0);
  if(s.room==='lobby'){if(panorama.complete&&panorama.naturalWidth)ctx.drawImage(panorama,0,0,1280,360);}
  else if(s.room==='restroom'){if(restroom.complete&&restroom.naturalWidth)ctx.drawImage(restroom,0,0,640,360);}
  else if(backgrounds.complete&&backgrounds.naturalWidth){const cuts=[0,714,1368,2048],col=tile%3,h=backgrounds.height/2;ctx.drawImage(backgrounds,cuts[col],Math.floor(tile/3)*h,cuts[col+1]-cuts[col],h,0,0,640,360);}
  const r=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  if(s.room==='delivery'&&s.flags.visitorDone&&!s.flags.accessClear&&bust.complete&&bust.naturalWidth){
   const x=217,y=57,w=231,h=264;ctx.drawImage(bust,1368+x/640*680,y/360*384,w/640*680,h/360*384,x,y,w,h);
  }
  if(s.room==='delivery'&&ActOne.visible(s,'mats')){r(127,248,48,8,'#343e49');r(130,251,44,2,'#839099');r(127,256,48,5,'#26333d');}
  if(s.room==='lobby'){
   if(!s.inventory.includes('brochure')&&!s.flags.brochureTaken&&brochure.complete&&brochure.naturalWidth)ctx.drawImage(brochure,0,0,brochure.width/3,brochure.height,49,215,28,36);
   const patch=(x,y,w,h)=>{if(opened.complete&&opened.naturalWidth)ctx.drawImage(opened,x/1280*opened.width,y/360*opened.height,w/1280*opened.width,h/360*opened.height,x,y,w,h);};
   if(s.flags.wcOpen&&wcDoor.complete&&wcDoor.naturalWidth)ctx.drawImage(wcDoor,829/1280*wcDoor.width,119/360*wcDoor.height,83/1280*wcDoor.width,133/360*wcDoor.height,829,119,83,133);
   if(s.flags.technicalOpen)patch(988,119,89,133);
   if(s.flags.sideOpen)patch(1182,113,75,170);
   // Small interactive access reader and the old/new room notice belong to the wall.
   r(965,170,12,25,'#202a30');r(967,173,8,8,s.flags.access?'#8edf92':'#b95447');r(969,185,4,6,'#839794');
   r(935,111,27,43,'#322f28');r(937,113,23,39,'#d3c6a1');
   ctx.fillStyle='#374446';ctx.font='5px monospace';ctx.fillText('K-17',940,123);ctx.fillText('T-03',940,135);r(940,141,15,1,'#776d57');r(940,146,12,1,'#776d57');
   if(s.flags.liftProtected){r(503,249,86,10,'#3c5361');r(505,250,82,2,'#738d97');}
  }
  if(s.room==='corridor'){r(364,76,13,6,s.flags.repaired?'#7bd49b':'#eb684e');}
  const actors=[];for(const o of ActOneWorld.rooms[s.room].objects)if(ActOneWorld.npcs[o[0]]&&ActOne.visible(s,o[0])){let [frame,x,y]=ActOneWorld.npcs[o[0]];if(o[0]==='technician'&&s.room==='corridor')x=651;actors.push({y,draw:()=>npc(ctx,o[0],x,y,t,s.room)});}
  if(s.room==='ending'){r(280,44,71,26,'#11191b');ctx.font='16px monospace';ctx.fillStyle='#e7b56d';ctx.fillText('−1',310,66);actors.push({y:492,draw:()=>npc(ctx,'rita',690,492,t,s.room)});}
  if(s.room==='lobby'&&panorama.complete&&panorama.naturalWidth)actors.push({y:402,draw:()=>ctx.drawImage(panorama,190/1280*panorama.width,193/360*panorama.height,248/1280*panorama.width,67/360*panorama.height,190,193,248,67)});
  actors.push({y:a.y,draw:()=>PixelScene.drawActor(ctx,a,s.room,t)});actors.sort((x,y)=>x.y-y.y).forEach(x=>x.draw());if(s.room==='restroom'&&restroom.complete&&restroom.naturalWidth){
   // Foreground furniture occludes the actor, while its footprint is excluded from navigation.
   ctx.save();ctx.beginPath();const outline=[[163,360],[163,337],[186,301],[213,301],[213,283],[222,279],[227,301],[235,301],[236,282],[247,282],[249,301],[255,301],[256,282],[270,282],[272,297],[278,297],[279,285],[285,284],[284,275],[290,269],[298,277],[304,272],[305,285],[313,284],[313,301],[382,301],[382,255],[388,248],[403,248],[410,255],[410,304],[418,304],[418,282],[421,280],[418,270],[428,266],[435,270],[435,283],[443,287],[443,301],[456,301],[480,337],[480,360]];outline.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.drawImage(restroom,0,0,640,360);ctx.restore();
  }ctx.restore();
 }
 return {render};
})();
