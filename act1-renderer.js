'use strict';
const ActOneScene=(()=>{
 const backgrounds=new Image(),people=new Image(),bust=new Image(),tiles=[];bust.src='assets/act1-delivery-bust.png';backgrounds.src='assets/act1-locations.png';people.src='assets/act1-characters.png';
 people.onload=()=>{const c=document.createElement('canvas');c.width=people.width;c.height=people.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(people,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data,w=c.width/3,h=c.height/3;
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){let left=Math.ceil(col*w),right=Math.floor((col+1)*w)-1,top=[0,418,833][row],bottom=[418,833,1254][row]-1,x=right,y=bottom,xx=left,yy=top;for(let j=top;j<=bottom;j++)for(let i=left;i<=right;i++)if(pixels[(j*c.width+i)*4+3]>110){x=Math.min(x,i);xx=Math.max(xx,i);y=Math.min(y,j);yy=Math.max(yy,j);}tiles.push({x,y,w:xx-x+1,h:yy-y+1});}
 };
 function npc(ctx,id,x,y,t){const data=ActOneWorld.npcs[id],tile=tiles[data[0]];if(!tile)return;let h=Math.round(72*Movement.scale('lobby',y)*2/3),w=Math.round(h*tile.w/tile.h);ctx.drawImage(people,tile.x,tile.y,tile.w,tile.h,Math.round(x*2/3-w/2),Math.round(y*2/3-h),w,h);}
 function render(ctx,s,a,t){ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,640,360);const tile=ActOneWorld.rooms[s.room].tile;
  if(backgrounds.complete&&backgrounds.naturalWidth){const cuts=[0,714,1368,2048],col=tile%3,h=backgrounds.height/2;ctx.drawImage(backgrounds,cuts[col],Math.floor(tile/3)*h,cuts[col+1]-cuts[col],h,0,0,640,360);}
  const r=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  if(s.room==='delivery'&&s.flags.visitorDone&&!s.flags.accessClear&&bust.complete&&bust.naturalWidth){
   const x=217,y=57,w=231,h=264;ctx.drawImage(bust,1368+x/640*680,y/360*384,w/640*680,h/360*384,x,y,w,h);
  }
  if(s.room==='delivery'&&ActOne.visible(s,'mats')){r(127,248,48,8,'#343e49');r(130,251,44,2,'#839099');r(127,256,48,5,'#26333d');}
  if(s.room==='vestibule'){if(s.flags.technicalOpen){ctx.fillStyle='#0e2027';ctx.beginPath();ctx.moveTo(14,49);ctx.lineTo(57,66);ctx.lineTo(57,287);ctx.lineTo(14,306);ctx.fill();r(48,67,8,218,'#51616a');r(43,166,6,3,'#b2b8ab');}r(453,183,5,5,s.flags.access?'#8edf92':'#e57162');}
  if(s.room==='corridor'){r(364,76,13,6,s.flags.repaired?'#7bd49b':'#eb684e');}
  if(s.room==='lobby'&&s.flags.liftProtected){r(585,255,53,6,'#4d6879');r(587,256,49,1,'#8da1a7');}
  const actors=[];for(const o of ActOneWorld.rooms[s.room].objects)if(ActOneWorld.npcs[o[0]]&&ActOne.visible(s,o[0])){let [frame,x,y]=ActOneWorld.npcs[o[0]];if(o[0]==='technician'&&s.room==='corridor')x=651;actors.push({y,draw:()=>npc(ctx,o[0],x,y,t)});}
  if(s.room==='ending'){r(280,44,71,26,'#11191b');ctx.font='16px monospace';ctx.fillStyle='#e7b56d';ctx.fillText('−1',310,66);actors.push({y:492,draw:()=>npc(ctx,'rita',690,492,t)});}
  actors.push({y:a.y,draw:()=>PixelScene.drawActor(ctx,a,s.room,t)});actors.sort((x,y)=>x.y-y.y).forEach(x=>x.draw());
 }
 return {render};
})();
