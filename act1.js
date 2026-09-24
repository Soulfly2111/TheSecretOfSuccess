'use strict';
const $=id=>document.getElementById(id),A=ActOne,W=ActOneWorld,rooms=W.rooms;
const scratch=new URLSearchParams(location.search).has('test'),saveKey='success-act1-v1';W.install(Movement);
let state=A.fresh(),verb='Gehe zu',selected=null,hover='',showAll=false,lastTime=0,sound=false,audio=null;
try{const s=scratch?null:JSON.parse(localStorage.getItem(saveKey));if(s)W.migrate(s);if(s&&rooms[s.room]&&Array.isArray(s.inventory)&&s.flags){state={...A.fresh(),...s,inventory:s.inventory.filter(id=>A.items[id]),journal:Array.isArray(s.journal)?s.journal:[]};}}catch{}
let actor=Movement.create(state.room),endingTimer,camera=0;
const verbs=['Öffne','Schließe','Drücke','Ziehe','Gehe zu','Nimm','Rede mit','Gib','Benutze','Schau an','Mach an','Mach aus'];
function save(){if(!scratch)try{localStorage.setItem(saveKey,JSON.stringify(state));}catch{}}
function say(text){$('speech').textContent=text;}
function ping(){if(!sound)return;audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=380;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.1);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.12);}
function sentence(){$('sentence').textContent=selected?`${verb==='Gib'?'Gib':'Benutze'} ${A.items[selected]} ${verb==='Gib'?'an':'mit'} ${hover||'…'}`:`${verb} ${hover||'…'}`;}
function clearChoices(){$('choices').replaceChildren();}
function chooseVerb(v){Movement.cancel(actor);verb=v;selected=null;clearChoices();renderControls();sentence();}
function icon(canvas,id){const c=canvas.getContext('2d'),r=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};if(id==='brochure'){r(3,2,18,21,'#c3a56a');r(4,3,16,19,'#1b2022');r(6,5,6,5,'#c3a56a');r(14,5,4,12,'#636f85');r(6,13,6,1,'#d5c79c');r(6,16,6,1,'#d5c79c');r(6,19,12,1,'#d5c79c');}else if(id==='techKey'){r(3,4,8,8,'#dfb56b');r(5,6,4,4,'#243138');r(10,10,11,3,'#dfb56b');r(17,12,3,5,'#dfb56b');}else if(id==='mats'){r(3,6,18,5,'#9ba6ae');r(3,12,18,5,'#4b6877');r(3,18,18,3,'#293f50');}else{r(4,3,16,19,'#e4d9b8');r(4,3,16,4,id==='serviceBadge'?'#5b9cad':id==='badge'?'#8f5861':'#b4905f');r(6,9,5,6,'#6b8f9a');r(13,9,5,1,'#5a655f');r(13,12,5,1,'#5a655f');r(6,18,12,1,'#5a655f');}}
function renderControls(){
 $('verbs').replaceChildren();for(const v of verbs){const b=document.createElement('button');b.textContent=v;b.className=v===verb?'active':'';b.setAttribute('aria-pressed',String(v===verb));b.onclick=()=>chooseVerb(v);$('verbs').append(b);}
 $('inventory').replaceChildren();$('item-count').textContent=`${state.inventory.length} ${state.inventory.length===1?'GEGENSTAND':'GEGENSTÄNDE'}`;
 for(const id of state.inventory){const b=document.createElement('button');b.className='item'+(selected===id?' selected':'');b.setAttribute('aria-label',A.items[id]);b.setAttribute('aria-pressed',String(selected===id));const c=document.createElement('canvas');c.width=24;c.height=24;icon(c,id);b.append(c,document.createTextNode(A.items[id]));b.onclick=()=>{Movement.cancel(actor);clearChoices();if(verb==='Schau an'){say(A.act(state,'Schau an',id));save();render();if(id==='brochure')showBrochure();return;}selected=selected===id?null:id;verb=verb==='Gib'?'Gib':'Benutze';renderControls();sentence();};$('inventory').append(b);}
}
function showChoices(target){clearChoices();for(const [id,label] of A.options(state,target)){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{say(A.act(state,'Wähle',id));selected=null;save();render();showChoices(target);};$('choices').append(b);}}
function render(){
 const room=rooms[state.room];camera=W.cameraX(state.room,actor.x);$('scene').dataset.room=state.room;$('location-name').textContent=room.name;$('location-sub').textContent=room.sub;$('hotspots').replaceChildren();
 for(const [id,label,x,y,w,h] of room.objects){if(!A.visible(state,id))continue;const b=document.createElement('button');b.className='hotspot';b.dataset.object=id;b.dataset.worldX=x/100*(room.width||960);b.dataset.worldWidth=w/100*(room.width||960);b.style.cssText=`top:${y}%;height:${h}%`;b.setAttribute('aria-label',label);const span=document.createElement('span');span.textContent=label;b.append(span);b.onmouseenter=b.onfocus=()=>{hover=label;$('hover-label').textContent=label;sentence();if(A.walkExit(state,id))$('sentence').textContent='Gehe zu '+label;};b.onmouseleave=b.onblur=()=>{hover='';$('hover-label').textContent='';sentence();};b.onclick=e=>{e.stopPropagation();approach(id);};$('hotspots').append(b);}
 $('map').replaceChildren();for(const [id,r] of Object.entries(rooms)){if(id==='ending')continue;const b=document.createElement('button');b.textContent=r.label;b.className=id===state.room?'active':'';b.setAttribute('aria-current',id===state.room?'location':'false');b.onclick=()=>travel(id);$('map').append(b);}
 updateCamera();renderControls();sentence();const f=state.flags,stages=[f.badgeIssued,f.visitorDone,f.sellerRejected&&f.techAdmitted,f.accessClear,f.repaired&&f.audited&&state.won];$('progress').textContent=state.won?'AKT 1 ABGESCHLOSSEN':`ERSTER ARBEITSTAG · ${stages.filter(Boolean).length} / 5`;
}
function approach(id){if(state.won){ending();return;}if(A.walkExit(state,id)){verb='Gehe zu';selected=null;renderControls();}clearChoices();const p=Movement.maps[state.room].spots[id];if(!p)return;Movement.move(actor,state.room,{x:p[0],y:p[1]},{target:id,verb,selected,room:state.room,facing:p[2]});$('sentence').textContent='Gehe zu '+rooms[state.room].objects.find(o=>o[0]===id)[1]+' …';}
function updateCamera(){
 camera=W.cameraX(state.room,actor.x);
 for(const b of $('hotspots').children){const x=Number(b.dataset.worldX)-camera,w=Number(b.dataset.worldWidth);b.style.left=`${x/960*100}%`;b.style.width=`${w/960*100}%`;b.hidden=x+w<=0||x>=960;}
 $('scene').dataset.cameraX=camera;
 $('pan-left').hidden=state.room!=='lobby'||actor.x<110;
 $('pan-right').hidden=state.room!=='lobby'||actor.x>1835;
 $('walk-hint').textContent=state.room==='lobby'?'← ERDGESCHOSS →':'ZURÜCK DURCH DIE TÜR';
}
function travel(destination){
 if(state.won){ending();return;}if(destination===state.room)return;clearChoices();selected=null;renderControls();
 const next=W.nextRoom(state.room,destination),target=W.exitTarget(state.room,next),p=Movement.maps[state.room].spots[target];
 Movement.move(actor,state.room,{x:p[0],y:p[1]},{room:state.room,travel:next,destination,facing:p[2]});$('sentence').textContent='Gehe zu '+rooms[destination].label+' …';
}
function enter(destination){
 const blocked=A.canEnter(state,destination);if(blocked){say(blocked);sentence();return false;}
 const from=state.room;if(from==='lobby'&&destination==='delivery'||from==='delivery')state.flags.sideOpen=true;
 if(destination==='restroom'||from==='restroom')state.flags.wcOpen=true;
 state.room=destination;actor=Movement.create(destination);const p=W.entry(destination,from);if(p){actor.x=p[0];actor.y=p[1];actor.direction=destination==='lobby'?'left':'down';}
 say(rooms[state.room].entry);save();render();return true;
}
function arrive(action){if(action.room!==state.room)return;
 if(action.travel){if(enter(action.travel)&&action.destination!==state.room)travel(action.destination);return;}
 if(!action.selected&&['Gehe zu','Benutze'].includes(action.verb)){
  const target=action.target,destination=target==='wc'?'restroom':target==='sideDoor'?'delivery':target==='techDoor'?'corridor':target==='lobbyExit'?'lobby':null;
  if(destination){enter(destination);return;}
 }
 if(action.verb==='Gehe zu'&&!action.selected){sentence();return;}
 ping();const before=state.room;say(A.act(state,action.verb,action.target,action.selected));selected=null;if(before!==state.room)actor=Movement.create(state.room);save();render();
 if(!action.selected&&((action.target==='phone'&&['Benutze','Rede mit'].includes(action.verb))||action.verb==='Rede mit'||action.target==='keyboard'&&['Nimm','Benutze'].includes(action.verb)))showChoices(action.target);
 if(state.won)endingTimer=setTimeout(ending,5500);
}
function showBrochure(){Movement.cancel(actor);popup('Black Hole Investments & Property Management',[]);$('modal').classList.add('brochure-modal');const img=document.createElement('img');img.src='assets/company-brochure-v1.png';img.alt='Aufgeschlagene Firmenbroschüre mit schwarzem Papier, goldener Schrift, Firmenlogo und Konzernhochhaus.';img.className='brochure-image';$('modal-content').append(img);const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Broschürentext lesen';details.append(summary);for(const text of brochureText){const p=document.createElement('p');p.textContent=text;details.append(p);}$('modal-content').append(details);}
const brochureText=['Das Zentrum der finanziellen Schwerkraft. Wo Ihr Kapital unwiderstehlich angezogen wird.','Willkommen im Zentrum der finanziellen Schwerkraft.','Wir definieren Märkte neu und verwandeln liquide Mittel in steile Renditekurven.','Kompromissloser Luxus. Chirurgische Präzision. Maximale Rendite.','Unsere Immobilien sind repräsentative Status-Symbole.','Warum wir?','Maximale Ertragseffizienz: Wir schöpfen Ihr Portfolio bis zum Limit aus. Was bei uns eintritt, verlässt uns nur als Reingewinn.','Architektonische Exzellenz: Repräsentativer Status mit Glanz und Gloria – von Marmor-Lobbys bis zu Gold-Armaturen.','Unerschütterliche Disziplin: Chirurgische Präzision ohne Verschwendung.','„Ein Investment bei uns ist wie ein physikalisches Gesetz: Die Masse wächst, die Dichte steigt, und die Konkurrenz gerät ins Wanken.“'];
function popup(title,text){$('modal').classList.remove('brochure-modal');$('modal-content').replaceChildren();const h=document.createElement('h2');h.textContent=title;$('modal-content').append(h);for(const line of text){const p=document.createElement('p');p.textContent=line;$('modal-content').append(p);}if(!$('modal').open)$('modal').showModal();}
function ending(){popup('Die erste „Beförderung“.',['Walter hat die Schicht bestätigt. Der Direktor nennt es ein Nachwuchsprogramm. Rita nennt es Arbeit.','Rita: „Morgen um sieben. Und zieh den Blazer aus. Sonst halten dich die Briefe für ihren Vorgesetzten.“','Die Etagenanzeige wechselt von 0 auf −1.','„Ich dachte, es geht hier aufwärts.“ – „Erst mal musst du wissen, was den Laden trägt.“','Akt 1 abgeschlossen. Akt 2: Streng vertraulich – die Poststelle folgt in einem späteren Kapitel.']);const a=document.createElement('a');a.className='chapter-link';a.href='index.html'+(scratch?'?test=chapters':'');a.textContent='Zur Kapitelauswahl';$('modal-content').append(a);}
function chapterMenu(){Movement.cancel(actor);popup('Kapitel auswählen',['Prolog und Akt 1 speichern ihren Fortschritt getrennt.']);for(const [label,url] of [['Prolog · Raus hier!','index.html?chapter=prolog'],['Akt 1 · Weiterspielen',null]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{save();if(url)location.href=url+(scratch?'&test=chapters':'');else $('modal').close();};$('modal-content').append(b);}}
$('chapters').onclick=chapterMenu;
document.querySelector('.wordmark').onclick=e=>{e.preventDefault();chapterMenu();};
$('journal').onclick=()=>popup('Notizbuch · Mein erster Arbeitstag',state.journal.length?state.journal:['Noch keine Notizen. Untersuche deine Einladung und die Unterlagen am Empfang.']);
$('help').onclick=()=>popup('Ein guter Plan öffnet Türen.',['Wähle ein Verb und klicke auf ein Objekt oder eine Person. Die Figur geht zuerst dorthin. Bei Gesprächen erscheinen zusätzliche Themen unter dem Dialog.','Dokumente lesen: „Schau an“ wählen, dann auf das Dokument im Inventar klicken. Zum Benutzen einen Gegenstand und danach das Ziel wählen.','Das Erdgeschoss ist doppelt so breit wie das Bild. Klicke auf den Boden oder die Randpfeile, um zu laufen; die Kamera folgt. Die Pfeiltasten funktionieren ebenfalls. Die Technikraumtür und der Nebeneingang zum Hof sind echte Ausgänge. Die Ortsleiste läuft zur passenden Tür, ohne zu teleportieren.','Wichtige Informationen werden im Notizbuch gespeichert. Falsche Anrufe lassen sich ohne Nachteil korrigieren.']);
$('close-modal').onclick=()=>$('modal').close();$('hint').onclick=()=>say(A.hint(state));
$('restart').onclick=()=>{popup('Akt 1 neu beginnen?',['Nur der Spielstand von Akt 1 wird ersetzt. Der Prolog bleibt erhalten.']);const b=document.createElement('button');b.textContent='Akt 1 neu beginnen';b.onclick=()=>{clearTimeout(endingTimer);state=A.fresh();actor=Movement.create(state.room);selected=null;verb='Gehe zu';save();clearChoices();render();say('Mit Koffer und Bewerbungsmappe. Das Management wartet. Hoffentlich.');$('modal').close();};$('modal-content').append(b);};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Ton an':'Ton aus';ping();};
$('reveal').onclick=()=>{showAll=!showAll;$('scene').classList.toggle('reveal',showAll);$('reveal').setAttribute('aria-pressed',String(showAll));};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){Movement.cancel(actor);selected=null;clearChoices();renderControls();sentence();}if(e.code==='Space'&&!$('modal').open&&document.activeElement.tagName!=='BUTTON'){e.preventDefault();$('scene').classList.add('reveal');}});
document.addEventListener('keyup',e=>{if(e.code==='Space')$('scene').classList.toggle('reveal',showAll);});
$('scene').onclick=e=>{if(e.target.closest('button')||state.won)return;const b=$('scene').getBoundingClientRect();Movement.move(actor,state.room,{x:(e.clientX-b.left)/b.width*960+camera,y:(e.clientY-b.top)/b.height*540});selected=null;clearChoices();renderControls();sentence();};
function walkAcross(direction){if($('modal').open||state.won)return;clearChoices();selected=null;renderControls();Movement.move(actor,state.room,{x:direction<0?88:(rooms[state.room].width||960)-65,y:Math.max(467,actor.y)});sentence();}
$('pan-left').onclick=e=>{e.stopPropagation();walkAcross(-1);};$('pan-right').onclick=e=>{e.stopPropagation();walkAcross(1);};
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)&&!$('modal').open){e.preventDefault();if(!e.repeat)walkAcross(e.key==='ArrowLeft'?-1:1);}});
document.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){Movement.cancel(actor);sentence();}});
const ctx=$('actors').getContext('2d');$('actors').width=640;$('actors').height=360;
function frame(t){const dt=Math.min(t-lastTime,50);lastTime=t;if(!$('modal').open){const action=Movement.tick(actor,dt,state.room);if(action)arrive(action);}updateCamera();ActOneScene.render(ctx,state,actor,t,camera);$('scene').dataset.moving=String(actor.moving);$('scene').dataset.direction=actor.direction;$('scene').dataset.actorX=actor.x.toFixed(1);$('scene').dataset.actorY=actor.y.toFixed(1);$('scene').dataset.flags=JSON.stringify(state.flags);$('scene').setAttribute('aria-busy',String(actor.moving));requestAnimationFrame(frame);}
render();if(state.won)ending();else if(state.journal.length)say('Zurück an der Pforte. Dein Spielstand und deine Notizen sind noch da.');requestAnimationFrame(frame);
