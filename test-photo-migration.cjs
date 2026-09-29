const {chromium}=require('playwright'),assert=require('node:assert/strict');(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const base=process.env.QA_URL||'http://127.0.0.1:8765/';const finishIntro=async p=>{await p.waitForFunction(()=>ActOneStory.phase==='talk');for(let i=0;i<3;i++)await p.locator('#story-dialogue').getByRole('button',{name:'Weiter',exact:true}).click();await p.waitForFunction(()=>state.flags.introDone);};
 const migrated=await browser.newContext();
 await migrated.addInitScript(()=>{
  if(!localStorage.getItem('qa-seeded')){
   localStorage.setItem('success-act1-v1',JSON.stringify({room:'ending',won:true,inventory:['brochure','badge'],flags:{audited:true}}));
   localStorage.setItem('success-prolog-v1','preserve-prolog');
   localStorage.setItem('qa-seeded','yes');
  }
 });
 const savedPage=await migrated.newPage();await savedPage.goto(base+'act1.html');
 await savedPage.waitForFunction(()=>document.querySelector('#inventory')?.children.length===2);
 const saves=await savedPage.evaluate(()=>({legacy:JSON.parse(localStorage.getItem('success-act1-v1')),current:JSON.parse(localStorage.getItem('success-act1-exploration-v1')),prolog:localStorage.getItem('success-prolog-v1')}));
 assert.equal(saves.legacy.room,'ending');assert.equal(saves.current.room,'lobby');assert.deepEqual(saves.current.inventory,['brochure','smartphone']);assert.equal(saves.prolog,'preserve-prolog');
 await finishIntro(savedPage);await savedPage.reload();await savedPage.waitForFunction(()=>document.querySelector('#inventory')?.children.length===2);

 for(const [label,id] of [['2. Etage','second'],['Teamleiterbüro','teamOffice'],['EMS-Training','ems'],['Pausenraum','lounge']]){
  await savedPage.locator('#map').getByRole('button',{name:label,exact:true}).click();
  await savedPage.waitForFunction(id=>state.room===id&&!actor.moving&&!transition,id);
  await savedPage.reload();await savedPage.waitForFunction(id=>state.room===id,id);
  assert.equal(await savedPage.locator('#inventory .item').count(),2);
 }

await browser.close();console.log('PASS photo migration: legacy untouched, smartphone added, brochure and prolog preserved, room saves');})().catch(e=>{console.error(e);process.exit(1)});