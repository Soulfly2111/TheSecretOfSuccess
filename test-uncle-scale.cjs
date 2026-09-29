const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.QA_URL||'http://127.0.0.1:8765/',out=process.env.QA_OUTPUT||'qa-speakers';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(base+'act1.html?test=scale');await page.waitForFunction(()=>ActOneCast.ready);
  const rows=await page.evaluate(async()=>{
   const metadata=await (await fetch('assets/act1-uncle-talk-v2.json')).json();
   const board=document.createElement('div');board.id='scale-proof';board.style='position:fixed;inset:0;z-index:100;background:#26343e;display:grid;grid-template-columns:repeat(12,1fr);align-content:start;pointer-events:none';document.body.append(board);
   return ['right','left','down','up'].map((direction,row)=>{
    ActOneCast.setSpeaker(null);ActOneCast.setSpeaker('uncle');const actor={x:80,y:170,direction,moving:false},found=new Map();
    for(let i=0;i<250;i++){
     const frame=ActOneCast.speechFrame;
     if(!found.has(frame)){
      let call;ActOneCast.draw({drawImage:(...args)=>{call=args;}},'uncle',actor,0,state);
      const [,sx,sy,w,h,x,y,dw,dh]=call,tile=metadata.frames[row*12+frame];
      const canvas=document.createElement('canvas');canvas.width=110;canvas.height=180;canvas.style='width:100%;image-rendering:pixelated';const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ActOneCast.draw(ctx,'uncle',actor,0,state);ctx.fillStyle='white';ctx.font='12px monospace';ctx.fillText(direction+' '+frame,2,165);
      found.set(frame,{sx,sy,scaleX:dw/w,scaleY:dh/h,footX:x+tile.anchorX*dw/w,footY:y+tile.anchorY*dh/h,canvas});
     }
     ActOneCast.update(20,state,true);
    }
    for(let f=0;f<12;f++)board.append(found.get(f).canvas);
    ActOneCast.setSpeaker('hero');let idle;ActOneCast.draw({drawImage:(...a)=>{idle=a;}},'uncle',actor,0,state);
    let walking;ActOneCast.draw({drawImage:(...a)=>{walking=a;}},'uncle',{...actor,moving:true,distance:14},0,state);
    return {frames:[...found.values()].map(({canvas,...data})=>data),idleHeight:idle[8],walkNeutralHeight:walking[8]};
   });
  });
  for(const row of rows){assert.equal(row.frames.length,12);for(const f of row.frames){assert(Math.abs(f.scaleX-row.frames[0].scaleX)<1e-10);assert(Math.abs(f.scaleY-f.scaleX)<1e-10);assert(Math.abs(f.footX-Math.round(80*2/3))<1e-10);assert(Math.abs(f.footY-Math.round(170*2/3))<1e-10);}assert(Math.abs(row.idleHeight-row.walkNeutralHeight)<=1);}
  await page.screenshot({path:out+'/uncle-fixed-scale-all-frames.png'});
  console.log('PASS: all 48 frames retain reference scale and fixed foot/body anchor; neutral walk-to-talk height matches within one canvas pixel.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
