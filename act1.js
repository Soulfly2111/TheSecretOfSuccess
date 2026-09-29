'use strict';
const $=id=>document.getElementById(id),A=ActOne,W=ActOneWorld,rooms=W.rooms;
const scratch=new URLSearchParams(location.search).has('test'),saveKey=A.saveKey;W.install(Movement);
let state=A.fresh(),verb='Gehe zu',selected=null,hover='',showAll=false,lastTime=0,sound=false,audio=null;
function readSave(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}}
if(!scratch)state=A.restore(readSave(saveKey),readSave(A.legacyKey),Object.keys(rooms));
let actor=Movement.create(state.room),camera=0,transition=null,liftVisual=null;
const verbs=['Öffne','Schließe','Drücke','Ziehe','Gehe zu','Nimm','Rede mit','Gib','Benutze','Schau an','Mach an','Mach aus'];
function save(){if(!scratch)try{localStorage.setItem(saveKey,JSON.stringify(state));}catch{}}
function say(text,source){const spoken=/^[^:]{1,35}:\s*„/.test(text);SceneDialogue.show(text,{speaker:spoken?source:undefined,blocking:/^(?!HANDBUCH:)[^:]{1,35}:\s*„/.test(text)});}
function ping(){if(!sound)return;audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=380;g.gain.setValueAtTime(.025,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.1);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.12);}
function sentence(){$('sentence').textContent=selected?`${verb==='Gib'?'Gib':'Benutze'} ${A.items[selected]} ${verb==='Gib'?'an':'mit'} ${hover||'…'}`:`${verb} ${hover||'…'}`;}
function clearChoices(){$('choices').replaceChildren();}
function chooseVerb(v){if(transition)return;Movement.cancel(actor);verb=v;selected=null;clearChoices();renderControls();sentence();}
function icon(canvas,id){const g=canvas.getContext('2d');if(id==='knife'){g.fillStyle='#b8cad1';g.fillRect(4,10,12,3);g.fillStyle='#866242';g.fillRect(16,10,6,3);return;}if(id==='keycard'){g.fillStyle='#dac28a';g.fillRect(2,5,20,14);g.fillStyle='#244955';g.fillRect(4,8,16,3);g.fillRect(5,14,6,2);return;}const context=canvas.getContext('2d');for(const [left,top,width,height,color] of [[3,2,18,21,'#c3a56a'],[4,3,16,19,'#1b2022'],[6,5,6,5,'#c3a56a'],[14,5,4,12,'#636f85'],[6,13,6,1,'#d5c79c'],[6,16,6,1,'#d5c79c'],[6,19,12,1,'#d5c79c']]){context.fillStyle=color;context.fillRect(left,top,width,height);}}
function renderControls(){
 $('verbs').replaceChildren();for(const v of verbs){const b=document.createElement('button');b.textContent=v;b.className=v===verb?'active':'';b.setAttribute('aria-pressed',String(v===verb));b.onclick=()=>chooseVerb(v);$('verbs').append(b);}
 $('inventory').replaceChildren();$('item-count').textContent=`${state.inventory.length} ${state.inventory.length===1?'GEGENSTAND':'GEGENSTÄNDE'}`;
 for(const id of state.inventory){const b=document.createElement('button');b.className='item'+(selected===id?' selected':'');b.setAttribute('aria-label',A.items[id]);b.setAttribute('aria-pressed',String(selected===id));const c=document.createElement('canvas');c.width=24;c.height=24;icon(c,id);b.append(c,document.createTextNode(A.items[id]));b.onclick=()=>{Movement.cancel(actor);clearChoices();if(verb==='Schau an'){say(A.act(state,'Schau an',id));save();render();if(id==='brochure')showBrochure();return;}selected=selected===id?null:id;verb=verb==='Gib'?'Gib':'Benutze';renderControls();sentence();};$('inventory').append(b);}
}
function render(){
 hover='';$('hover-label').textContent='';
 const room=rooms[state.room];camera=W.cameraX(state.room,actor.x);$('scene').dataset.room=state.room;$('location-name').textContent=room.name;$('location-sub').textContent=room.sub;$('hotspots').replaceChildren();
 for(const [id,label,x,y,w,h] of room.objects){if(!A.visible(state,id))continue;const b=document.createElement('button');b.className='hotspot';b.dataset.object=id;b.dataset.worldX=x/100*(room.width||960);b.dataset.worldWidth=w/100*(room.width||960);b.style.cssText=`top:${y}%;height:${h}%`;b.setAttribute('aria-label',label);const span=document.createElement('span');span.textContent=label;b.append(span);b.onmouseenter=b.onfocus=()=>{if(transition)return;hover=label;$('hover-label').textContent=label;sentence();if(A.walkExit(state,id)&&!['Schließe','Schau an'].includes(verb))$('sentence').textContent='Gehe zu '+label;};b.onmouseleave=b.onblur=()=>{hover='';$('hover-label').textContent='';sentence();};b.onclick=e=>{e.stopPropagation();approach(id);};$('hotspots').append(b);}
 $('map').replaceChildren();for(const [id,r] of Object.entries(rooms)){const b=document.createElement('button');b.textContent=r.label;b.className=id===state.room?'active':'';b.setAttribute('aria-current',id===state.room?'location':'false');b.onclick=()=>travel(id);$('map').append(b);}
 updateCamera();renderControls();sentence();$('progress').textContent=state.flags.cardReturned?'WALTERS EMPFEHLUNG ERHALTEN':'AKT 1 · WALTERS SCHLÜSSELKARTE';
}
function approach(id,explicit=false){if(transition||!A.visible(state,id))return;if(!explicit&&A.walkExit(state,id)&&!['Schließe','Schau an'].includes(verb)){verb='Gehe zu';selected=null;renderControls();}clearChoices();const p=Movement.maps[state.room].spots[id];if(!p)return;Movement.move(actor,state.room,{x:p[0],y:p[1]},{target:id,verb,selected,room:state.room,facing:p[2]});$('sentence').textContent='Gehe zu '+rooms[state.room].objects.find(o=>o[0]===id)[1]+' …';}
function updateCamera(){
 camera=W.cameraX(state.room,actor.x);
 for(const b of $('hotspots').children){if(b.dataset.object==='walter'&&ActOneCast.actors.walter){const person=ActOneCast.actors.walter;b.dataset.worldX=person.x-35;b.style.top=(person.y-160)/540*100+'%';b.style.height='30%';}const x=Number(b.dataset.worldX)-camera,w=Number(b.dataset.worldWidth);b.style.left=`${x/960*100}%`;b.style.width=`${w/960*100}%`;b.hidden=x+w<=0||x>=960;}
 $('scene').dataset.cameraX=camera;
 $('pan-left').hidden=(rooms[state.room].width||960)<=960||actor.x<110;
 $('pan-right').hidden=(rooms[state.room].width||960)<=960||actor.x>(rooms[state.room].width||960)-85;
 $('walk-hint').textContent=(rooms[state.room].width||960)>960?'← '+rooms[state.room].label.toUpperCase()+' →':'ZURÜCK DURCH DIE TÜR';
}
function travel(destination){
 if(transition||destination===state.room)return;
 clearChoices();selected=null;verb='Gehe zu';renderControls();
 const edge=W.route(state.room,destination)[0];if(!edge)return;
 const point=Movement.maps[state.room].spots[edge.target];
 Movement.move(actor,state.room,{x:point[0],y:point[1]},{room:state.room,edge,destination,facing:point[2]});
 $('sentence').textContent='Gehe zu '+rooms[destination].label+' …';
}
function enter(edge,destination){
 state.room=edge.to;
 actor=Movement.create(state.room);
 const point=W.entry(edge);actor.x=point[0];actor.y=point[1];actor.direction=point[2];
 if(edge.kind==='elevator')liftVisual={room:state.room,elapsed:0,arrival:true};
 say(state.room==='corridor'&&state.flags.cleaningLightOn?'Der Reinigungsraum. Alles steht bereit für saubere Arbeit.':rooms[state.room].entry);save();render();
 if(destination&&destination!==state.room)travel(destination);
}
function startTransition(edge,destination){
 if(edge.flag)state.flags[edge.flag]=true;
 if(edge.kind==='elevator'){
  liftVisual={room:state.room,elapsed:0,arrival:false};
  say('Der Aufzug öffnet sich. Nächster Halt: '+rooms[edge.to].label+'.');
 }
 transition={edge,destination,elapsed:0,duration:edge.kind==='elevator'?1100:edge.flag?350:280};
 save();render();
}
function arrive(action){
 if(action.room!==state.room)return;
 if(action.edge){startTransition(action.edge,action.destination);return;}
 if(action.target==='elevator'&&!action.selected&&['Gehe zu','Benutze','Öffne','Drücke'].includes(action.verb)){showLiftMenu();return;}
 const edge=W.connection(state.room,action.target);
 if(edge&&!action.selected&&['Gehe zu','Benutze'].includes(action.verb)){startTransition(edge);return;}
 if(action.verb==='Gehe zu'&&!action.selected){sentence();return;}
 if(action.target==='walter'&&!action.selected&&['Rede mit','Benutze'].includes(action.verb)){ActOneStory.walter();selected=null;renderControls();return;}
 const returned=state.flags.cardReturned;ping();say(A.act(state,action.verb,action.target,action.selected),action.target);if(action.selected==='knife'&&state.flags.cardTaken)actor.gesture=650;selected=null;save();render();if(!returned&&state.flags.cardReturned)ActOneStory.thanks();
}
function showLiftMenu(){
 Movement.cancel(actor);selected=null;
 const origin=state.room;
 popup('Aufzug · Etage wählen',['Aktueller Standort: '+rooms[origin].label+'.']);
 $('modal').classList.add('lift-modal');$('close-modal').textContent='Abbrechen';
 for(const option of W.liftOptions(origin)){
  const button=document.createElement('button');button.textContent=option.label;button.disabled=option.current;button.dataset.floor=option.id;
  button.onclick=()=>{
   if(state.room!==origin||transition)return;
   const edge=W.connection(origin,'elevator',option.id);if(!edge)return;
   $('modal').close();startTransition(edge);
  };
  $('modal-content').append(button);
 }
}
function showBrochure(){Movement.cancel(actor);popup('Black Hole Investments & Property Management',[]);$('modal').classList.add('brochure-modal');const img=document.createElement('img');img.src='assets/company-brochure-v1.png';img.alt='Aufgeschlagene Firmenbroschüre mit schwarzem Papier, goldener Schrift, Firmenlogo und Konzernhochhaus.';img.className='brochure-image';$('modal-content').append(img);const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Broschürentext lesen';details.append(summary);for(const text of brochureText){const p=document.createElement('p');p.textContent=text;details.append(p);}$('modal-content').append(details);}
const brochureText=['Das Zentrum der finanziellen Schwerkraft. Wo Ihr Kapital unwiderstehlich angezogen wird.','Willkommen im Zentrum der finanziellen Schwerkraft.','Wir definieren Märkte neu und verwandeln liquide Mittel in steile Renditekurven.','Kompromissloser Luxus. Chirurgische Präzision. Maximale Rendite.','Unsere Immobilien sind repräsentative Status-Symbole.','Warum wir?','Maximale Ertragseffizienz: Wir schöpfen Ihr Portfolio bis zum Limit aus. Was bei uns eintritt, verlässt uns nur als Reingewinn.','Architektonische Exzellenz: Repräsentativer Status mit Glanz und Gloria – von Marmor-Lobbys bis zu Gold-Armaturen.','Unerschütterliche Disziplin: Chirurgische Präzision ohne Verschwendung.','„Ein Investment bei uns ist wie ein physikalisches Gesetz: Die Masse wächst, die Dichte steigt, und die Konkurrenz gerät ins Wanken.“'];
function popup(title,text){$('modal').classList.remove('brochure-modal','lift-modal');$('close-modal').textContent='Weiter geht’s';$('modal-content').replaceChildren();const h=document.createElement('h2');h.textContent=title;$('modal-content').append(h);for(const line of text){const p=document.createElement('p');p.textContent=line;$('modal-content').append(p);}if(!$('modal').open)$('modal').showModal();}
function chapterMenu(){Movement.cancel(actor);popup('Kapitel auswählen',['Prolog und Akt 1 speichern ihren Fortschritt getrennt.']);for(const [label,url] of [['Prolog · Raus hier!','index.html?chapter=prolog'],['Akt 1 · Weiterspielen',null]]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{save();if(url)location.href=url+(scratch?'&test=chapters':'');else $('modal').close();};$('modal-content').append(b);}}
$('chapters').onclick=chapterMenu;
document.querySelector('.wordmark').onclick=e=>{e.preventDefault();chapterMenu();};
$('journal').onclick=()=>popup('Notizbuch · Mein erster Arbeitstag',state.journal.length?state.journal:['Freie Erkundung: Erdgeschoss, 1. und 2. Etage sind über Treppe und Aufzug verbunden. Die Firmenbroschüre liegt neben dem Haupteingang.']);
$('help').onclick=()=>popup('Das Gebäude erkunden',[
'Wähle ein Verb und klicke auf ein Objekt oder eine Person. Die Figur geht zuerst dorthin. Neben der Firmenbroschüre findest du Gegenstände für Walters verlorene Schlüsselkarte.',
'Broschüre lesen: „Schau an“ wählen und die Firmenbroschüre im Inventar anklicken.',
'Erdgeschoss, 1. und 2. Etage sind breite Panoramen. Klicke auf den Boden oder die Randpfeile. Die Kamera folgt. Die Pfeiltasten bewegen die Figur nach links, rechts, oben und unten.',
'Treppen verbinden benachbarte Etagen. In der 1. Etage gibt es getrennte Auf- und Abgänge. Am Aufzug wählst du Erdgeschoss, 1. oder 2. Etage. Die Ortsleiste nutzt dieselben Wege. Offene Türen wechseln automatisch auf „Gehe zu“; „Schließe“ und „Schau an“ bleiben gezielt wählbar.',
'Hilf Walter, seine Schlüsselkarte wiederzufinden. Frag ihn bei einem weiteren Gespräch nach dem letzten Fundort. Alle Etagen bleiben zugänglich.'
]);
$('close-modal').onclick=()=>$('modal').close();$('hint').onclick=()=>say(A.hint(state));
$('restart').onclick=()=>{popup('Akt 1 neu beginnen?',['Nur der neue Erkundungsspielstand wird ersetzt. Der alte Rätselspielstand und der Prolog bleiben erhalten.']);const b=document.createElement('button');b.textContent='Akt 1 neu beginnen';b.onclick=()=>{transition=null;liftVisual=null;state=A.fresh();ActOneStory.reset();actor=Movement.create(state.room);selected=null;verb='Gehe zu';save();clearChoices();render();say(rooms.lobby.entry);$('modal').close();};$('modal-content').append(b);};
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Ton an':'Ton aus';ping();};
$('reveal').onclick=()=>{showAll=!showAll;$('scene').classList.toggle('reveal',showAll);$('reveal').setAttribute('aria-pressed',String(showAll));};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!transition){Movement.cancel(actor);selected=null;clearChoices();renderControls();sentence();}if(e.code==='Space'&&!$('modal').open&&document.activeElement.tagName!=='BUTTON'){e.preventDefault();$('scene').classList.add('reveal');}});
document.addEventListener('keyup',e=>{if(e.code==='Space')$('scene').classList.toggle('reveal',showAll);});
$('scene').onclick=e=>{if(e.target.closest('button')||transition)return;const b=$('scene').getBoundingClientRect();Movement.move(actor,state.room,{x:(e.clientX-b.left)/b.width*960+camera,y:(e.clientY-b.top)/b.height*540});selected=null;clearChoices();renderControls();sentence();};
function walkAcross(direction){if($('modal').open||transition)return;clearChoices();selected=null;renderControls();Movement.move(actor,state.room,{x:direction<0?88:(rooms[state.room].width||960)-65,y:Math.max(467,actor.y)});sentence();}
$('pan-left').onclick=e=>{e.stopPropagation();walkAcross(-1);};$('pan-right').onclick=e=>{e.stopPropagation();walkAcross(1);};
document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&!$('modal').open&&!transition){e.preventDefault();if(e.repeat)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight')walkAcross(e.key==='ArrowLeft'?-1:1);else{clearChoices();Movement.move(actor,state.room,{x:actor.x,y:e.key==='ArrowUp'?300:510});}}});
document.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&!transition){Movement.cancel(actor);sentence();}});
const ctx=$('actors').getContext('2d');$('actors').width=640;$('actors').height=360;
function frame(t){
 const dt=Math.min(t-lastTime,50);lastTime=t;
 if(!document.hidden&&!$('modal').open&&!window.MobileUI?.blocking()){
  ActOneStory.update(dt,t);
  if(!ActOneStory.locked()&&!SceneDialogue.locked){
   if(liftVisual){liftVisual.elapsed+=dt;if(liftVisual.arrival&&liftVisual.elapsed>1100)liftVisual=null;}
   if(transition){transition.elapsed+=dt;if(transition.elapsed>=transition.duration){const completed=transition;transition=null;enter(completed.edge,completed.destination);}}
   else{const action=Movement.tick(actor,dt,state.room);if(action)arrive(action);}
  }
 }
 updateCamera();ActOneScene.render(ctx,state,actor,t,camera,ActOneStory.lift||liftVisual);
 $('scene').dataset.transition=transition?.edge.kind||(transition?'door':'');$('scene').dataset.moving=String(actor.moving);$('scene').dataset.direction=actor.direction;$('scene').dataset.actorX=actor.x.toFixed(1);$('scene').dataset.actorY=actor.y.toFixed(1);$('scene').dataset.flags=JSON.stringify(state.flags);$('scene').dataset.story=ActOneStory.phase;$('scene').dataset.speaker=ActOneCast.speaker||'';$('scene').setAttribute('aria-busy',String(actor.moving));requestAnimationFrame(frame);
}
ActOneStory.init({state:()=>state,hero:()=>actor,save,render,say,ready:()=>!transition&&!$('modal').open&&!window.MobileUI?.blocking()});
render();save();say(state.room==='corridor'&&state.flags.cleaningLightOn?'Der Reinigungsraum. Alles steht bereit für saubere Arbeit.':rooms[state.room].entry);requestAnimationFrame(frame);
MobileUI.init({
 verbs,room:()=>state.room,busy:()=>!!transition||ActOneStory.locked(),label:id=>rooms[state.room].objects.find(o=>o[0]===id)?.[1]||A.items[id]||id,
 rooms:()=>Object.entries(rooms).map(([id,r])=>({id,label:r.label})),travel,
 inventory:()=>state.inventory.map(id=>({id,label:A.items[id]})),direct:id=>A.walkExit(state,id),
 actions:id=>id==='lightSwitch'?[state.flags.cleaningLightOn?'Mach aus':'Mach an','Benutze','Schau an']:id==='radiator'?['Schau an','Benutze']:id==='drawer'?['Öffne','Schließe','Schau an']:['knife','keycard'].includes(id)?['Nimm','Schau an']:W.connection(state.room,id)?['Gehe zu','Öffne','Schließe','Schau an']:W.npcs?.[id]?['Rede mit','Schau an']:id==='brochureStand'?['Nimm','Schau an']:['Schau an','Benutze','Rede mit'],
 object:(id,v,item)=>{verb=v;selected=item;renderControls();approach(id,true);},
 item:(id,v,item)=>{Movement.cancel(actor);say(A.act(state,v,id,item));save();render();if(id==='brochure'&&v==='Schau an')showBrochure();},
 cancel:()=>{Movement.cancel(actor);selected=null;verb='Gehe zu';clearChoices();renderControls();sentence();}
});
