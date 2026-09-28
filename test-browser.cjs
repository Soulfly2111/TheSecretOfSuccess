const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output=process.env.QA_OUTPUT||'qa-output';
fs.mkdirSync(output,{recursive:true});
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1050}});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const finishIntro=async(page)=>{for(let i=0;i<3;i++)await page.locator('#story-dialogue').getByRole('button',{name:'Weiter',exact:true}).click();await page.waitForFunction(()=>state.flags.introDone);};
 const base=process.env.QA_URL||'http://127.0.0.1:8765/';
 const settle=()=>page.waitForFunction(()=>!actor.moving&&!transition);
 const room=async(id)=>{await page.waitForFunction(id=>document.querySelector('#scene').dataset.room===id,id);await settle();};
 const verb=label=>page.locator('#verbs').getByRole('button',{name:label,exact:true}).click();
 const object=id=>page.locator('[data-object="'+id+'"]').click();
 const shot=name=>page.screenshot({path:output+'/'+name+'.png',fullPage:true});
 const map=async(label,id)=>{await page.locator('#map').getByRole('button',{name:label,exact:true}).click();await room(id);};
 await page.goto(base+'act1.html?test=explore');
 await page.waitForFunction(()=>document.querySelectorAll('#hotspots button').length>5);
 await page.waitForFunction(()=>ActOneScene&&document.querySelector('#actors').width===640);
 await finishIntro(page);await shot('ground');
 await verb('Nimm');await object('brochureStand');await settle();
 assert.equal(await page.locator('#inventory .item').count(),1);
 await verb('Schau an');await page.getByRole('button',{name:'Firmenbroschüre',exact:true}).click();
 assert(await page.locator('.brochure-image').isVisible());await shot('brochure');
 await page.locator('#close-modal').click();
 await map('1. Etage','upper');await shot('upper-arrival');
 assert(Math.abs(Number(await page.locator('#scene').getAttribute('data-actor-x'))-1098)<1);
 await map('Officeküche','kitchen');await shot('kitchen');
 await verb('Schau an');await object('sink');await settle();
 assert.match(await page.locator('#speech').innerText(),/Spüle/);
 await map('1. Etage','upper');
 await verb('Schließe');await object('kitchenDoor');await settle();await shot('kitchen-door-closed');
 await verb('Öffne');await object('kitchenDoor');await settle();await shot('kitchen-door-open');
 await object('kitchenDoor');await room('kitchen');
 await map('1. Etage','upper');
 await verb('Rede mit');await object('officeStaff');await settle();await shot('office');
 assert.match(await page.locator('#speech').innerText(),/Mitarbeiterin/);
 await page.locator('#pan-right').click();await settle();await shot('meeting');
 await verb('Rede mit');await object('meetingStaff');await settle();
 assert.match(await page.locator('#speech').innerText(),/Besprechung/);
 await page.keyboard.down('ArrowLeft');
 await page.waitForFunction(()=>actor.x<1250);
 await page.keyboard.up('ArrowLeft');await settle();
 await verb('Gehe zu');await object('elevator');await page.locator('[data-floor="lobby"]').click();
 await page.waitForFunction(()=>transition?.edge.kind==='elevator'&&liftVisual?.elapsed>=750);
 await shot('elevator-opening');await room('lobby');
 assert(Math.abs(Number(await page.locator('#scene').getAttribute('data-actor-x'))-806)<1);
 await object('elevator');await page.locator('[data-floor="upper"]').click();await room('upper');
 assert(Math.abs(Number(await page.locator('#scene').getAttribute('data-actor-x'))-905)<1);
 await object('stairs');await room('lobby');
 assert(Math.abs(Number(await page.locator('#scene').getAttribute('data-actor-x'))-1085)<1);
 for(const [label,id] of [['WC','restroom'],['Technikraum','corridor'],['Lieferhof','delivery']]){
  await map(label,id);await shot(id);
  if(id==='corridor'){await verb('Benutze');await object('freight');await settle();assert.equal(await page.locator('#scene').getAttribute('data-room'),'corridor');assert(!await page.locator('#modal').isVisible());}
  await map('Erdgeschoss','lobby');
 }
 await map('Officeküche','kitchen');
 await map('Lieferhof','delivery');
 assert.equal(await page.locator('#inventory .item').count(),1);

 await map('2. Etage','second');await shot('second-arrival');
 await verb('Schau an');await object('floorGuide');await settle();
 assert.match(await page.locator('#speech').innerText(),/WC: Erdgeschoss/);
 await verb('Gehe zu');await object('stairs');await room('upper');
 assert(Math.abs(Number(await page.locator('#scene').getAttribute('data-actor-x'))-1176)<1);
 await object('stairsUp');await room('second');
 assert(Math.abs(Number(await page.locator('#scene').getAttribute('data-actor-x'))-1228)<1);
 await object('elevator');await page.locator('.lift-modal').waitFor();
 assert(await page.locator('[data-floor="second"]').isDisabled());
 await shot('lift-menu');await page.locator('#close-modal').click();await settle();
 assert.equal(await page.locator('#scene').getAttribute('data-room'),'second');
 for(const destination of ['lobby','second','upper','second','lobby','upper']){
  await object('elevator');await page.locator('[data-floor="'+destination+'"]').click();await room(destination);
 }
 await map('2. Etage','second');
 for(const [label,id,door] of [['Teamleiterbüro','teamOffice','officeDoor'],['EMS-Training','ems','emsDoor'],['Pausenraum','lounge','loungeDoor']]){
  await map(label,id);await shot(id);
  assert.equal(await page.locator('#inventory .item').count(),1);
  const person={teamOffice:'teamLeader',ems:'trainer',lounge:'breakStaff'}[id];
  await verb('Rede mit');await object(person);await settle();
  assert.match(await page.locator('#speech').innerText(),/Teamleiter:|Trainer:|Mitarbeiterin:/);
  await map('2. Etage','second');
  await verb('Schließe');await object(door);await settle();await shot(id+'-closed');
  await verb('Öffne');await object(door);await settle();await shot(id+'-open');
  assert.equal(await page.locator('#scene').getAttribute('data-room'),'second');
  await object(door);await room(id);
  await verb('Gehe zu');await object('secondExit');await room('second');
 }
 await page.locator('#pan-left').click();await settle();await shot('second-copy-room');
 await verb('Rede mit');await object('copyStaff');await settle();
 assert.match(await page.locator('#speech').innerText(),/Kopierer/);
 await map('Officeküche','kitchen');await map('EMS-Training','ems');
 await page.goto(base+'index.html?chapter=prolog&test=explore');
 await page.waitForFunction(()=>document.querySelector('#hotspots').children.length>0);
 await shot('prolog');
 assert.equal(errors.length,0,errors.join('\n'));
 await context.close();
 const migrated=await browser.newContext();
 await migrated.addInitScript(()=>{
  if(!localStorage.getItem('qa-seeded')){
   localStorage.setItem('success-act1-v1',JSON.stringify({room:'ending',won:true,inventory:['brochure','badge'],flags:{audited:true}}));
   localStorage.setItem('success-prolog-v1','preserve-prolog');
   localStorage.setItem('qa-seeded','yes');
  }
 });
 const savedPage=await migrated.newPage();await savedPage.goto(base+'act1.html');
 await savedPage.waitForFunction(()=>document.querySelector('#inventory')?.children.length===1);
 const saves=await savedPage.evaluate(()=>({legacy:JSON.parse(localStorage.getItem('success-act1-v1')),current:JSON.parse(localStorage.getItem('success-act1-exploration-v1')),prolog:localStorage.getItem('success-prolog-v1')}));
 assert.equal(saves.legacy.room,'ending');assert.equal(saves.current.room,'lobby');assert.deepEqual(saves.current.inventory,['brochure']);assert.equal(saves.prolog,'preserve-prolog');
 await finishIntro(savedPage);await savedPage.reload();await savedPage.waitForFunction(()=>document.querySelector('#inventory')?.children.length===1);

 for(const [label,id] of [['2. Etage','second'],['Teamleiterbüro','teamOffice'],['EMS-Training','ems'],['Pausenraum','lounge']]){
  await savedPage.locator('#map').getByRole('button',{name:label,exact:true}).click();
  await savedPage.waitForFunction(id=>state.room===id&&!actor.moving&&!transition,id);
  await savedPage.reload();await savedPage.waitForFunction(id=>state.room===id,id);
  assert.equal(await savedPage.locator('#inventory .item').count(),1);
 }
 await browser.close();
 console.log('PASS browser: three floors, all elevator directions/cancel, new room doors both ways, conversations, all new room save/reloads, brochure and prolog regressions, no JS errors.');
})().catch(error=>{console.error(error);process.exit(1);});
