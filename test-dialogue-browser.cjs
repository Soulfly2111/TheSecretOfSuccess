const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.QA_URL||'http://127.0.0.1:8765/',out=process.env.QA_OUTPUT||'qa-dialogue';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:667,height:375}:{width:1440,height:1050},hasTouch:mobile,isMobile:mobile});
  const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'index.html?chapter=prolog&test=dialogue');
  assert.equal(await p.locator('#speech').count(),1);assert.equal(await p.locator('.mobile-speech').count(),0);
  await p.evaluate(()=>{window.chosen=null;SceneDialogue.choices([{id:'one',text:'Wo hast du die Karte zuletzt gesehen?'},{id:'two',text:'Ich suche weiter.'},{id:'three',text:'Bis später.'}],item=>{window.chosen=item.id;SceneDialogue.show(item.text,{blocking:true});});});
  await p.screenshot({path:out+'/'+(mobile?'touch':'desktop')+'-choices.png'});
  const first=p.locator('[data-topic="one"]'),second=p.locator('[data-topic="two"]');
  if(!mobile){await second.hover();assert.equal(await second.evaluate(b=>getComputedStyle(b).color),'rgb(255, 240, 168)');await first.focus();await p.keyboard.press('Tab');assert(await second.evaluate(b=>b===document.activeElement));await p.keyboard.press('Enter');}
  else await second.tap();
  assert.equal(await p.evaluate(()=>window.chosen),'two');assert.equal(await p.locator('#speech').textContent(),'Ich suche weiter.');
  const before=await p.evaluate(()=>({x:actor.x,y:actor.y}));await p.locator('#speech').click();assert.deepEqual(await p.evaluate(()=>({x:actor.x,y:actor.y})),before);assert(await p.locator('#story-dialogue').isHidden());
  await p.evaluate(()=>SceneDialogue.show('Da blitzt etwas hinter der Heizung: Walters Schlüsselkarte!'));assert.equal(await p.locator('#story-dialogue strong').textContent(),'DU');
  await p.evaluate(()=>SceneDialogue.show('Kalle: „Erst Kaffee, dann Werkzeug!“',{blocking:true}));assert.equal(await p.locator('#story-dialogue strong').textContent(),'KALLE');
  await p.keyboard.press('Enter');assert(await p.locator('#story-dialogue').isHidden());
  await p.evaluate(()=>SceneDialogue.show(Array.from({length:30},(_,i)=>'Ein langer gut lesbarer Text Nummer '+i+'.').join(' ')));
  const firstPage=await p.locator('#speech').textContent();await p.locator('#story-dialogue button').click();assert.notEqual(await p.locator('#speech').textContent(),firstPage);
  for(const size of [{width:667,height:375},{width:390,height:844},{width:1180,height:820}]){
   await p.setViewportSize(size);const r=await p.evaluate(()=>{const a=document.getElementById('scene').getBoundingClientRect(),b=document.getElementById('story-dialogue').getBoundingClientRect();return {inside:b.left>=a.left&&b.right<=a.right&&b.top>=a.top&&b.bottom<=a.bottom};});assert(r.inside);
  }
  await p.screenshot({path:out+'/'+(mobile?'touch':'desktop')+'-text.png'});
  assert.deepEqual(errors,[]);await context.close();
 }
 await browser.close();console.log('PASS dialogue: one scene overlay, hover, focus, keyboard, touch, speaker labels, pagination, no click-through and responsive containment.');
})().catch(e=>{console.error(e);process.exit(1);});
