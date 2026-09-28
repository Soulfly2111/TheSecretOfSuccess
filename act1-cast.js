const ActOneCast=(()=>{
 const sheets={},names=['uncle','walter'];
 for(const id of names){const image=new Image(),frames=[];sheets[id]={image,frames};image.onload=()=>{
  const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);const pixels=g.getImageData(0,0,c.width,c.height).data;
  for(let row=0;row<4;row++)for(let col=0;col<7;col++){
   const l=Math.round(col*c.width/7),r=Math.round((col+1)*c.width/7),top=Math.round(row*c.height/4),bottom=Math.round((row+1)*c.height/4);
   let x=r,y=bottom,xx=l,yy=top;
   for(let j=top;j<bottom;j++)for(let i=l;i<r;i++)if(pixels[(j*c.width+i)*4+3]>110){x=Math.min(x,i);xx=Math.max(xx,i);y=Math.min(y,j);yy=Math.max(yy,j);}
   let footL=r,footR=l;for(let j=Math.round(y+(yy-y)*.7);j<=yy;j++)for(let i=x;i<=xx;i++)if(pixels[(j*c.width+i)*4+3]>110){footL=Math.min(footL,i);footR=Math.max(footR,i);}
   frames.push({x,y,w:xx-x+1,h:yy-y+1,anchor:(footL+footR)/2-x});
  }
 };image.src='assets/act1-'+id+'-animation-v1.png';}
 const actors={};let speaker=null,elapsed=0,pause=600;
 function init(){actors.walter=Movement.create('lobby');Object.assign(actors.walter,{x:689,y:445,direction:'left'});actors.uncle=null;speaker=null;pause=600;}
 function update(dt,state,holdWalter){elapsed+=dt;const a=actors.walter;if(!a||state.room!=='lobby')return;
  if(holdWalter||speaker==='walter'||state.flags.cardReturned){Movement.cancel(a);a.direction='left';return;}
  if(a.moving){Movement.tick(a,dt,'lobby');if(!a.moving)pause=1300;}
  else if((pause-=dt)<=0)Movement.move(a,'lobby',{x:a.x<685?716:660,y:445});
 }
 function draw(ctx,id,a,t,state){const sheet=sheets[id],row={right:0,left:1,down:2,up:3}[a.direction]||0;
  let frame=a.moving?1+Math.floor(a.phase/160)%2:speaker===id?4+Math.floor(t/210)%2:Math.floor(t/150)%25===0?3:id==='walter'&&!state.flags.cardReturned&&Math.floor(t/700)%4<2?6:0;
  const tile=sheet.frames[row*7+frame];if(!tile)return;
  const h=Math.round(72*Movement.scale('lobby',a.y)*2/3),scale=h/Math.max(...sheet.frames.map(f=>f.h));
  ctx.drawImage(sheet.image,tile.x,tile.y,tile.w,tile.h,Math.round(a.x*2/3-tile.anchor*scale),Math.round(a.y*2/3-tile.h*scale),Math.round(tile.w*scale),Math.round(tile.h*scale));
 }
 return {actors,init,update,draw,get speaker(){return speaker;},setSpeaker:id=>{speaker=id;},get ready(){return names.every(id=>sheets[id].frames.length===28);}};
})();
