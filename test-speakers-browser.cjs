const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.QA_URL||'http://127.0.0.1:8765/',out=process.env.QA_OUTPUT||'qa-speakers';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:1050},hasTouch:mobile,isMobile:mobile});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'act1.html?test=speakers');await p.waitForFunction(()=>ActOneStory.phase==='talk'&&ActOneCast.talkReady);
  assert.equal(await p.locator('#story-dialogue').getAttribute('data-speaker'),'uncle');
  assert.equal(await p.locator('#speech').evaluate(n=>getComputedStyle(n).color),'rgb(255, 101, 101)');
  const frames=await p.evaluate(async()=>{const seen=new Set();for(let i=0;i<100;i++){seen.add(ActOneCast.speechFrame);await new Promise(r=>setTimeout(r,35));}return [...seen];});assert.equal(frames.length,12);
  await p.screenshot({path:out+'/'+(mobile?'touch':'desktop')+'-uncle.png'});
  await p.evaluate(()=>document.getElementById('modal').showModal());const before=await p.evaluate(()=>ActOneCast.speechTime);await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>ActOneCast.speechTime),before);await p.evaluate(()=>document.getElementById('modal').close());
  await p.locator('#story-dialogue button').click();assert.equal(await p.locator('#story-dialogue').getAttribute('data-speaker'),'hero');assert.equal(await p.evaluate(()=>ActOneCast.speechFrame),0);
  await p.locator('#story-dialogue button').click();assert.equal(await p.locator('#story-dialogue').getAttribute('data-speaker'),'uncle');await p.locator('#story-dialogue button').click();await p.waitForFunction(()=>state.flags.introDone);
  // Exercise real engine replies and the source-ID adapter, including duplicate display names.
  for(const id of ['reception','driver','technician','officeStaff','meetingStaff','teamLeader','copyStaff','trainer','breakStaff','intercom']){
   await p.evaluate(id=>say(ActOne.act(state,id==='intercom'?'Benutze':'Rede mit',id),id),id);
   const expected=await p.evaluate(id=>Speakers.get(id),id);assert.equal(await p.locator('#story-dialogue').getAttribute('data-speaker'),expected.id);
   const color=await p.locator('#speech').evaluate(n=>getComputedStyle(n).color),labelColor=await p.locator('#story-dialogue strong').evaluate(n=>getComputedStyle(n).color);assert.equal(color,labelColor);
   const rgb=expected.color.match(/\w\w/g).map(x=>parseInt(x,16));assert.equal(color,`rgb(${rgb.join(', ')})`);
  }
  await p.evaluate(()=>ActOneStory.walter());assert.equal(await p.locator('#speech').evaluate(n=>getComputedStyle(n).color),'rgb(255, 224, 102)');
  await p.screenshot({path:out+'/'+(mobile?'touch':'desktop')+'-walter.png'});
  await p.goto(base+'index.html?chapter=prolog&test=speakers');await p.evaluate(()=>say(Adventure.act(state,'Rede mit','mechanic')));assert.equal(await p.locator('#story-dialogue').getAttribute('data-speaker'),'mechanic');assert.equal(await p.locator('#speech').evaluate(n=>getComputedStyle(n).color),'rgb(118, 219, 131)');
  await p.evaluate(()=>SceneDialogue.choices([{id:'reply',text:'Ich suche weiter.'}],()=>{}));assert.equal(await p.locator('#story-dialogue').getAttribute('data-speaker'),'hero');assert.equal(await p.locator('#story-dialogue').evaluate(n=>getComputedStyle(n).color),'rgb(87, 169, 255)');
  assert.deepEqual(errors,[]);await context.close();
 }
 await browser.close();console.log('PASS speakers: twelve animation frames, paused timeline, neutral speaker handoff, intro departure, all NPC colors, duplicate-name identities, intercom, Kalle and blue answers on desktop/touch.');
})().catch(e=>{console.error(e);process.exit(1);});
