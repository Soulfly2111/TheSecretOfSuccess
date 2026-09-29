const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const base=process.env.QA_URL||'http://127.0.0.1:8765/',out=process.env.QA_OUTPUT||'qa-mobile';fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const context=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
const rail=name=>p.locator('.mobile-rail').getByRole('button',{name,exact:true});
const panel=name=>p.locator('#mobile-panel').getByRole('button',{name,exact:true});
const settled=()=>p.waitForFunction(()=>!actor.moving&&(typeof transition==='undefined'||!transition));
const room=id=>p.waitForFunction(id=>state.room===id&&!actor.moving&&(typeof transition==='undefined'||!transition),id);
async function map(label,id){await dismiss();await rail('Orte').tap();await panel(label).tap();await room(id);}
async function target(id){
 const b=p.locator('[data-object="'+id+'"]');const label=await b.getAttribute('aria-label');await b.tap();
 if(await p.locator('#mobile-panel[open]').isVisible()&&await p.locator('#mobile-panel h2').textContent()==='Welches Objekt?')await panel(label).tap();
}
async function dismiss(){while(await p.evaluate(()=>SceneDialogue.locked))await p.locator('#story-dialogue button').last().tap();}
async function action(id,v){await dismiss();await rail('Aktionen').tap();await panel(v).tap();await target(id);await settled();}
async function item(id,v='Benutze'){await rail('Inventar').tap();await p.locator('#mobile-panel [data-item="'+id+'"]').tap();await panel(v).tap();}
async function use(itemId,targetId,v='Benutze'){await item(itemId,v);await target(targetId);await settled();}
async function layout(name){
 assert(await p.locator('body').evaluate(n=>n.classList.contains('mobile-game')));
 const metrics=await p.evaluate(()=>{const r=document.querySelector('#scene').getBoundingClientRect();return {ratio:r.width/r.height,w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,buttons:[...document.querySelectorAll('.mobile-rail button')].map(b=>b.getBoundingClientRect().height)};});
 assert(Math.abs(metrics.ratio-16/9)<.01);assert(metrics.sw<=metrics.w+1);assert(metrics.sh<=metrics.h+1);assert(metrics.buttons.every(h=>h>=44));
 await p.screenshot({path:out+'/'+name+'.png'});
}
await p.goto(base+'index.html?chapter=prolog');await p.waitForFunction(()=>document.body.classList.contains('mobile-game'));
for(const [w,h] of [[667,375],[844,390],[932,430],[1180,820]]){await p.setViewportSize({width:w,height:h});await layout('prolog-'+w);}
await p.setViewportSize({width:844,height:390});
await map('Ländliches Haus','house');
await target('cup');assert.equal(await p.locator('#mobile-panel h2').textContent(),'Leere Tasse');
const before=await p.locator('#scene').getAttribute('data-actor-x');await p.waitForTimeout(150);assert.equal(await p.locator('#scene').getAttribute('data-actor-x'),before);
await panel('Nimm').tap();assert.equal(await p.evaluate(()=>state.inventory.includes('cup')),false);await settled();
await action('manual','Nimm');await item('manual','Schau an');assert(await p.evaluate(()=>state.flags.read));
assert(await p.locator('#story-dialogue button').isVisible());const firstPage=await p.locator('#story-dialogue p').textContent();await p.locator('#story-dialogue button').tap();assert.notEqual(await p.locator('#story-dialogue p').textContent(),firstPage);
await action('key','Nimm');await action('cupboard','Öffne');
// The tiny coffee hotspot overlaps the cabinet; choosing the object is mandatory.
await p.locator('[data-object="grounds"]').tap();assert.equal(await p.locator('#mobile-panel h2').textContent(),'Welches Objekt?');await panel('Kaffeepulver').tap();await panel('Nimm').tap();await settled();assert.equal(await p.locator('[data-object="grounds"]').count(),0);
await map('Vor dem Haus','yard');await use('cup','well');await map('Ländliches Haus','house');await use('water','pot');await use('grounds','pot');await action('stove','Mach an');await use('cup','pot');
await map('Garage','garage');await use('coffee','mechanic','Gib');await action('toolbox','Öffne');await action('toolbox','Nimm');await action('rag','Nimm');
await map('Scheune','barn');await use('wrench','tractor');await item('rag');await rail('Inventar').tap();await p.locator('[data-item="dirtybelt"]').tap();assert(await p.evaluate(()=>state.inventory.includes('belt')));
await p.setViewportSize({width:667,height:375});await rail('Inventar').tap();await p.screenshot({path:out+'/inventory.png'});await panel('Zurück').tap();await p.setViewportSize({width:844,height:390});
await map('Vor dem Haus','yard');await action('car','Öffne');await use('wrench','car');await use('belt','car');
await item('key');await p.locator('.mobile-selection button').tap();assert(await p.locator('.mobile-selection button').isHidden());
// Rotation preserves a pending walk, and the preference is independent of game saves.
await target('garage');await p.setViewportSize({width:390,height:844});await p.locator('.mobile-rotate button').tap();await p.setViewportSize({width:844,height:390});await room('garage');await map('Vor dem Haus','yard');
await p.reload();await p.waitForFunction(()=>state.flags.tight&&state.flags.belt);await use('key','car');assert(await p.evaluate(()=>state.won));await p.waitForTimeout(800);await p.locator('#close-modal').tap();
await p.goto(base+'act1.html');await p.waitForFunction(()=>document.body.classList.contains('mobile-game'));for(let i=0;i<3;i++)await p.locator('#story-dialogue').getByRole('button',{name:'Weiter',exact:true}).tap();await p.waitForFunction(()=>state.flags.introDone);
await action('brochureStand','Nimm');await item('brochure','Schau an');assert(await p.locator('.brochure-image').isVisible());await p.locator('#close-modal').tap();
await map('1. Etage','upper');await target('stairsUp');await room('second');await target('stairs');await room('upper');
await target('elevator');await p.locator('.lift-modal').waitFor();assert(await p.locator('[data-floor="upper"]').isDisabled());await p.locator('#close-modal').tap();assert.equal(await p.evaluate(()=>state.room),'upper');
for(const id of ['lobby','second','upper','second','lobby','upper']){await target('elevator');await p.locator('[data-floor="'+id+'"]').tap();await room(id);}
await map('Pausenraum','lounge');await action('breakStaff','Rede mit');assert.match(await p.locator('#speech').textContent(),/Tasse Kaffee/);
await map('2. Etage','second');await action('loungeDoor','Schließe');await action('loungeDoor','Öffne');assert.equal(await p.evaluate(()=>state.room),'second');await target('loungeDoor');await room('lounge');
await p.reload();await room('lounge');assert.deepEqual(await p.evaluate(()=>state.inventory),['brochure']);
for(const [w,h] of [[667,375],[844,390],[932,430],[1180,820]]){await p.setViewportSize({width:w,height:h});await layout('act1-'+w);}
await p.setViewportSize({width:844,height:390});await rail('Menü').tap();await panel('Klassische Ansicht').tap();assert(!await p.locator('body').evaluate(n=>n.classList.contains('mobile-game')));await p.locator('.mobile-toggle').tap();await p.reload();assert(await p.locator('body').evaluate(n=>n.classList.contains('mobile-game')));
assert.deepEqual(errors,[]);await browser.close();console.log('PASS mobile: complete prolog via touch, inventory combinations, overlaps, arrival-only interactions, rotation, layouts, Act 1 doors/stairs/all lifts/cancel, brochure, save reload and UI preference; no JS errors.');
})().catch(e=>{console.error(e);process.exit(1);});
