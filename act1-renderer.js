'use strict';
const ActOneScene=(()=>{
 const upper=new Image(),upperOpen=new Image(),kitchen=new Image();upper.src='assets/act1-first-floor-v1.png';upperOpen.src='assets/act1-first-floor-open-v1.png';kitchen.src='assets/act1-office-kitchen-v1.png';
 const upperStairs=new Image();upperStairs.src='assets/act1-first-floor-stairs-v2.png';
 const second=new Image(),secondOpen=new Image(),teamOffice=new Image(),ems=new Image(),lounge=new Image();
 second.src='assets/act1-second-floor-v1.png';secondOpen.src='assets/act1-second-floor-open-v1.png';teamOffice.src='assets/act1-team-office-v1.png';ems.src='assets/act1-ems-v1.png';lounge.src='assets/act1-lounge-v1.png';
 const extraPeople=new Image(),extraTiles=[];extraPeople.src='assets/act1-second-characters-v1.png';
 const newBackgrounds={second,teamOffice,ems,lounge};
 extraPeople.onload=()=>{
  const canvas=document.createElement('canvas');canvas.width=extraPeople.width;canvas.height=extraPeople.height;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(extraPeople,0,0);
  const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
  for(let row=0;row<2;row++)for(let column=0;column<2;column++){
   const startX=Math.floor(column*canvas.width/2),endX=Math.floor((column+1)*canvas.width/2);
   const startY=Math.floor(row*canvas.height/2),endY=Math.floor((row+1)*canvas.height/2);
   let left=endX,right=startX,top=endY,bottom=startY;
   for(let vertical=startY;vertical<endY;vertical++)for(let horizontal=startX;horizontal<endX;horizontal++){
    if(pixels[(vertical*canvas.width+horizontal)*4+3]<=110)continue;
    left=Math.min(left,horizontal);right=Math.max(right,horizontal);top=Math.min(top,vertical);bottom=Math.max(bottom,vertical);
   }
   extraTiles.push({x:left,y:top,w:right-left+1,h:bottom-top+1});
  }
 };
 const brochure=new Image();brochure.src='assets/company-brochure-v1.png';
 const restroom=new Image(),wcDoor=new Image();restroom.src='assets/act1-wc-v1.png';wcDoor.src='assets/act1-ground-wc-open-v1.png';
 const panorama=new Image(),opened=new Image();panorama.src='assets/act1-ground-floor-v2.png';opened.src='assets/act1-ground-floor-open-v2.png';
 const backgrounds=new Image(),people=new Image(),tiles=[];backgrounds.src='assets/act1-locations.png';people.src='assets/act1-characters.png';
 people.onload=()=>{const c=document.createElement('canvas');c.width=people.width;c.height=people.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(people,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data,w=c.width/3,h=c.height/3;
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){let left=Math.ceil(col*w),right=Math.floor((col+1)*w)-1,top=[0,418,833][row],bottom=[418,833,1254][row]-1,x=right,y=bottom,xx=left,yy=top;for(let j=top;j<=bottom;j++)for(let i=left;i<=right;i++)if(pixels[(j*c.width+i)*4+3]>110){x=Math.min(x,i);xx=Math.max(xx,i);y=Math.min(y,j);yy=Math.max(yy,j);}tiles.push({x,y,w:xx-x+1,h:yy-y+1});}
 };
 function npc(ctx,id,x,y,t,room='lobby'){const data=ActOneWorld.npcs[id],tile=(data[3]==='second'?extraTiles:tiles)[data[0]];if(!tile)return;let h=Math.round(72*Movement.scale(room,y)*2/3),w=Math.round(h*tile.w/tile.h);ctx.drawImage(data[3]==='second'?extraPeople:people,tile.x,tile.y,tile.w,tile.h,Math.round(x*2/3-w/2),Math.round(y*2/3-h),w,h);}
 function patchImage(ctx,image,box,width){if(!image.complete||!image.naturalWidth)return;const [left,top,span,height]=box;ctx.drawImage(image,left/width*image.width,top/360*image.height,span/width*image.width,height/360*image.height,left,top,span,height);}
 function render(ctx,s,a,t,camera=0,liftVisual=null){ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,640,360);const tile=ActOneWorld.rooms[s.room].tile;ctx.save();ctx.translate(-Math.round(camera*2/3),0);
  if(s.room==='lobby'){if(panorama.complete&&panorama.naturalWidth)ctx.drawImage(panorama,0,0,1280,360);}
  else if(s.room==='restroom'){if(restroom.complete&&restroom.naturalWidth)ctx.drawImage(restroom,0,0,640,360);}
  else if(s.room==='upper'){if(upper.complete&&upper.naturalWidth)ctx.drawImage(upper,0,0,1280,360);}
  else if(s.room==='kitchen'){if(kitchen.complete&&kitchen.naturalWidth)ctx.drawImage(kitchen,0,0,640,360);}
  else if(newBackgrounds[s.room]){const backdrop=newBackgrounds[s.room];if(backdrop.complete&&backdrop.naturalWidth)ctx.drawImage(backdrop,0,0,s.room==='second'?1280:640,360);}
  else if(backgrounds.complete&&backgrounds.naturalWidth){const cuts=[0,714,1368,2048],col=tile%3,h=backgrounds.height/2;ctx.drawImage(backgrounds,cuts[col],Math.floor(tile/3)*h,cuts[col+1]-cuts[col],h,0,0,640,360);}
  const r=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  if(s.room==='lobby'){
   if(!s.inventory.includes('brochure')&&!s.flags.brochureTaken&&brochure.complete&&brochure.naturalWidth)ctx.drawImage(brochure,0,0,brochure.width/3,brochure.height,49,215,28,36);
   const patch=(x,y,w,h)=>{if(opened.complete&&opened.naturalWidth)ctx.drawImage(opened,x/1280*opened.width,y/360*opened.height,w/1280*opened.width,h/360*opened.height,x,y,w,h);};
   if(s.flags.wcOpen&&wcDoor.complete&&wcDoor.naturalWidth)ctx.drawImage(wcDoor,829/1280*wcDoor.width,119/360*wcDoor.height,83/1280*wcDoor.width,133/360*wcDoor.height,829,119,83,133);
   if(s.flags.technicalOpen)patch(988,119,89,133);
   if(s.flags.sideOpen)patch(1182,113,75,170);
  }
  if(s.room==='corridor'){r(364,76,13,6,'#7bd49b');}
  if(s.room==='upper'){
   patchImage(ctx,upperStairs,[708,56,138,203],1280);
   r(858,143,40,28,'#bc9d58');ctx.fillStyle='#252923';ctx.font='7px monospace';ctx.fillText('WC: EG',862,154);ctx.fillText('↓',875,164);
  }
  if(s.room==='second'){
   if(s.flags.officeOpen)patchImage(ctx,secondOpen,[12,126,70,151],1280);
   if(s.flags.emsOpen)patchImage(ctx,secondOpen,[980,126,81,131],1280);
   if(s.flags.loungeOpen)patchImage(ctx,secondOpen,[1144,126,85,131],1280);
   r(871,128,35,46,'#bfa161');r(873,130,31,42,'#222e31');ctx.fillStyle='#eed59d';ctx.font='5px monospace';ctx.fillText('WC: EG',876,140);ctx.fillText('BESPR.',876,152);ctx.fillText('1. ET.',876,161);
  }
  if(s.room==='upper'&&s.flags.kitchenOpen)patchImage(ctx,upperOpen,[12,126,70,151],1280);
  if(liftVisual?.room===s.room&&upperOpen.complete&&upperOpen.naturalWidth){
   const opening=liftVisual.arrival?Math.max(0,1-Math.max(0,liftVisual.elapsed-500)/600):Math.min(1,liftVisual.elapsed/700);
   const box=s.room==='lobby'?[505,123,80,125]:[570,135,67,120];
   ctx.save();ctx.beginPath();ctx.rect(box[0]+box[2]*(1-opening)/2,box[1],box[2]*opening,box[3]);ctx.clip();
   const cabin=s.room==='second'?secondOpen:upperOpen;if(cabin.complete&&cabin.naturalWidth)ctx.drawImage(cabin,570/1280*cabin.width,135/360*cabin.height,67/1280*cabin.width,120/360*cabin.height,...box);ctx.restore();
  }
  const actors=[];for(const o of ActOneWorld.rooms[s.room].objects)if(ActOneWorld.npcs[o[0]]&&ActOne.visible(s,o[0])){let [frame,x,y]=ActOneWorld.npcs[o[0]];if(o[0]==='technician'&&s.room==='corridor')x=651;actors.push({y,draw:()=>npc(ctx,o[0],x,y,t,s.room)});}
  if(s.room==='lobby'&&panorama.complete&&panorama.naturalWidth)actors.push({y:402,draw:()=>ctx.drawImage(panorama,190/1280*panorama.width,193/360*panorama.height,248/1280*panorama.width,67/360*panorama.height,190,193,248,67)});
  if(s.room==='upper')for(const [depth,box] of [[372,[175,175,140,71]],[372,[353,175,137,71]],[379,[981,180,196,73]]])actors.push({y:depth,draw:()=>patchImage(ctx,upper,box,1280)});
  if(s.room==='kitchen')actors.push({y:418,draw:()=>patchImage(ctx,kitchen,[500,180,140,103],640)});
  const foreground={
   second:[[343,[242,141,86,85]],[364,[180,170,74,73]],[332,[331,121,113,97]]],
   teamOffice:[[334,[249,144,198,70]],[349,[248,154,74,74]]],
   ems:[[292,[153,111,156,85]],[290,[399,80,63,110]],[330,[503,142,55,77]]],
   lounge:[[301,[235,144,180,55]],[328,[272,181,129,39]],[349,[465,144,143,90]]]
  };
  for(const [depth,box] of foreground[s.room]||[])actors.push({y:depth,draw:()=>patchImage(ctx,newBackgrounds[s.room],box,s.room==='second'?1280:640)});
  actors.push({y:a.y,draw:()=>PixelScene.drawActor(ctx,a,s.room,t)});actors.sort((x,y)=>x.y-y.y).forEach(x=>x.draw());if(s.room==='restroom'&&restroom.complete&&restroom.naturalWidth){
   // Foreground furniture occludes the actor, while its footprint is excluded from navigation.
   ctx.save();ctx.beginPath();const outline=[[163,360],[163,337],[186,301],[213,301],[213,283],[222,279],[227,301],[235,301],[236,282],[247,282],[249,301],[255,301],[256,282],[270,282],[272,297],[278,297],[279,285],[285,284],[284,275],[290,269],[298,277],[304,272],[305,285],[313,284],[313,301],[382,301],[382,255],[388,248],[403,248],[410,255],[410,304],[418,304],[418,282],[421,280],[418,270],[428,266],[435,270],[435,283],[443,287],[443,301],[456,301],[480,337],[480,360]];outline.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.clip();ctx.drawImage(restroom,0,0,640,360);ctx.restore();
  }ctx.restore();
 }
 return {render};
})();
