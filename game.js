'use strict';
const $=id=>document.getElementById(id),A=Adventure;
const scratch=new URLSearchParams(location.search).has('test');
const rooms={yard:{name:'Ein Hof. Große Pläne.',label:'Vor dem Haus',sub:'IRGENDWO AUF DEM LAND · 06:12',entry:'Da steht er. Mein rotes Ticket in die große weite Welt. Leider ohne funktionierenden Motor.',objects:[['house','Zum Haus',10,40,10,24],['barn','Zur Scheune',39,38,25,22],['garage','Zur Garage',85,42,14,24],['car','Roter Kleinwagen',54,60,30,28],['well','Brunnen',0,69,19,25]]},garage:{name:'Für alles ein Werkzeug.',label:'Garage',sub:'KALLES REICH · GARAGE',entry:'Es riecht nach Motoröl und jahrelanger Erfahrung. Kalle ist natürlich schon hier.',objects:[['toolbox','Werkzeugkasten',10,47,12,11],['rag','Putzlappen',27,53,8,15],['mechanic','Kalle',68,42,10,42],['yard','Zurück zum Hof',88,34,11,43]]},barn:{name:'Hier rostet die Zukunft.',label:'Scheune',sub:'STAUB, HEU UND ERSATZTEILE · SCHEUNE',entry:'Früher habe ich hier Verstecken gespielt. Heute suche ich einen Ausweg.',objects:[['hay','Heuballen',12,43,22,34],['chest','Alte Truhe',40,54,16,23],['tractor','Alter Traktor',61,41,25,34],['yard','Zurück zum Hof',89,35,10,43]]},house:{name:'Noch ein letzter Kaffee.',label:'Ländliches Haus',sub:'DAS ZUHAUSE · KÜCHE',entry:'Alles wie immer. Nur ich habe heute andere Pläne.',objects:[['manual','Reparaturhandbuch',15,58,20,13],['key','Autoschlüssel',68,26,7,14],['cup','Leere Tasse',62,48,7,10],['pot','Kaffeekanne',48,43,6,13],['stove','Herd',40,51,15,30],['cupboard','Küchenschrank',56,59,19,25],['grounds','Kaffeepulver',62.5,65,4,5],['yard','Zurück zum Hof',88,29,11,49]]}};
let state=A.fresh(),verb='Gehe zu',selected=null,hover='',sound=false,audio=null,lastTime=0,showAll=false;
try{const saved=scratch?null:JSON.parse(localStorage.getItem('success-prolog-v1'));if(saved&&rooms[saved.room]&&Array.isArray(saved.inventory)&&saved.flags&&typeof saved.flags==='object'){state={room:saved.room,inventory:saved.inventory.filter(x=>A.items[x]),flags:saved.flags,won:!!saved.won};}}catch{}
let actor=Movement.create(state.room),endTimer=null;
const verbs=['Öffne','Schließe','Drücke','Ziehe','Gehe zu','Nimm','Rede mit','Gib','Benutze','Schau an','Mach an','Mach aus'];
function save(){if(scratch)return;try{localStorage.setItem('success-prolog-v1',JSON.stringify(state));}catch{}}
function say(t){$('speech').textContent=t;}
function ping(){if(!sound)return;audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.setValueAtTime(330,audio.currentTime);o.frequency.exponentialRampToValueAtTime(440,audio.currentTime+.08);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.14);}
function sentence(){let item=selected?A.items[selected]:'';$('sentence').textContent=selected?`${verb==='Gib'?'Gib':'Benutze'} ${item} ${verb==='Gib'?'an':'mit'} ${hover||'…'}`:`${verb} ${hover||'…'}`;}
function selectVerb(v){Movement.cancel(actor);verb=v;selected=null;renderVerbs();renderInventory();sentence();}
function renderVerbs(){$('verbs').replaceChildren();verbs.forEach(v=>{let b=document.createElement('button');b.textContent=v;b.className=v===verb?'active':'';b.setAttribute('aria-pressed',v===verb);b.onclick=()=>selectVerb(v);$('verbs').append(b);});}
function renderInventory(){$('inventory').replaceChildren();$('item-count').textContent=`${state.inventory.length} ${state.inventory.length===1?'GEGENSTAND':'GEGENSTÄNDE'}`;if(!state.inventory.length){let p=document.createElement('p');p.className='empty';p.textContent='Noch nichts in den Taschen. Dafür große Pläne.';$('inventory').append(p);return;}state.inventory.forEach(id=>{let b=document.createElement('button');b.className='item'+(selected===id?' selected':'');b.setAttribute('aria-label',A.items[id]);b.setAttribute('aria-pressed',selected===id);let c=document.createElement('canvas');c.width=24;c.height=24;drawItem(c,id);b.append(c,document.createTextNode(A.items[id]));b.onmouseenter=()=>{hover=A.items[id];sentence();};b.onmouseleave=()=>{hover='';sentence();};b.onclick=()=>{Movement.cancel(actor);ping();if(selected&&selected!==id){interact(id);return;}if(verb==='Schau an'||id==='manual'){say(A.act(state,'Schau an',id));save();updateProgress();return;}selected=selected===id?null:id;verb=verb==='Gib'?'Gib':'Benutze';renderVerbs();renderInventory();sentence();};$('inventory').append(b);});}
function drawItem(canvas,id){let c=canvas.getContext('2d');let r=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};if(id==='key'){r(4,5,8,8,'#e9ba6b');r(6,7,4,4,'#172232');r(11,11,10,3,'#e9ba6b');r(17,14,3,4,'#e9ba6b');}else if(id==='wrench'){r(5,4,4,7,'#a3b9c6');r(13,4,4,7,'#a3b9c6');r(5,9,12,4,'#b7c8cc');r(9,11,4,11,'#a3b9c6');}else if(id==='manual'){r(4,3,17,19,'#d1b57e');r(4,3,3,19,'#a4754e');r(9,7,8,2,'#4d6072');r(9,12,7,1,'#6c746d');r(9,15,7,1,'#6c746d');}else if(id==='rag'){r(3,7,16,12,'#769cae');r(6,5,13,10,'#9abcd0');r(7,9,2,9,'#537e96');r(13,8,2,7,'#759caf');}else if(id==='grounds'){r(6,3,13,18,'#784431');r(5,3,15,3,'#cba66c');r(7,9,11,7,'#e4c991');r(11,11,3,3,'#543326');}else if(['coffee','cup','water'].includes(id)){r(4,7,12,13,'#ded8b9');r(16,9,5,7,'#a99c81');r(17,11,2,3,'#172232');r(6,7,8,3,id==='coffee'?'#694534':id==='water'?'#70bbd2':'#645e52');if(id==='coffee')r(7,2,1,3,'#b4b9bd');}else{r(4,4,16,17,id==='dirtybelt'?'#756048':'#8c8c81');r(7,7,10,11,'#172232');r(7,20,10,2,'#40372f');if(id==='dirtybelt')r(4,9,4,5,'#392c23');}}
function gone(id){const v=SceneState.objects(state);return ['manual','key','rag','cup','grounds'].includes(id)&&!v[id];}
function renderRoom(){const room=rooms[state.room];$('scene').dataset.room=state.room;$('location-name').textContent=room.name;$('location-sub').textContent=room.sub;$('hotspots').replaceChildren();room.objects.filter(o=>!gone(o[0])).forEach(([id,label,x,y,w,h])=>{let b=document.createElement('button');b.className='hotspot';b.style.cssText=`left:${x}%;top:${y}%;width:${w}%;height:${h}%`;b.setAttribute('aria-label',label);b.dataset.object=id;let s=document.createElement('span');s.textContent=label;b.append(s);b.onmouseenter=b.onfocus=()=>{hover=label;$('hover-label').textContent=label;sentence();};b.onmouseleave=b.onblur=()=>{hover='';$('hover-label').textContent='';sentence();};b.onclick=e=>{e.stopPropagation();ping();approach(id);};$('hotspots').append(b);});$('map').replaceChildren();Object.entries(rooms).forEach(([id,r],i)=>{let b=document.createElement('button');b.innerHTML=`<span>0${i+1}</span>${r.label}`;b.className=id===state.room?'active':'';b.setAttribute('aria-current',id===state.room?'location':'false');b.onclick=()=>travel(id);$('map').append(b);});}
function approach(id,continuation=null){
 if(state.won){ending();return;}
 const spot=Movement.maps[state.room].spots[id];if(!spot)return;
 const action={target:id,verb,selected,room:state.room,facing:spot[2],continuation};
 if(Movement.move(actor,state.room,{x:spot[0],y:spot[1]},action)){
  $('sentence').textContent=`Gehe zu ${rooms[state.room].objects.find(o=>o[0]===id)?.[1]||id} …`;
  $('scene').setAttribute('aria-busy','true');
 }else say('Dorthin finde ich gerade keinen freien Weg.');
}
function travel(id){
 if(id===state.room)return;
 if(state.room==='yard')approach(id);
 else approach('yard',id==='yard'?null:id);
}
function changeRoom(id,continuation=null){
 const previous=state.room;
 state.room=id;selected=null;hover='';actor=Movement.create(id);
 if(id==='yard'&&Movement.maps.yard.entries[previous]){[actor.x,actor.y]=Movement.maps.yard.entries[previous];actor.direction='down';}
 say(rooms[id].entry);render();save();
 if(continuation)approach(continuation);
}
function completeAction(action){
 $('scene').setAttribute('aria-busy','false');
 if(action.room!==state.room)return;
 if(rooms[action.target]){changeRoom(action.target,action.continuation);return;}
 if(action.verb==='Gehe zu'&&!action.selected){sentence();return;}
 actor.gesture=450;
 interact(action.target,action.verb,action.selected);
}
function interact(id,actionVerb=verb,actionItem=selected){
 if(state.won){ending();return;}
 say(A.act(state,actionVerb,id,actionItem));selected=null;render();save();
 if(id==='mechanic'&&(actionVerb==='Rede mit'||actionVerb==='Gib'||actionItem==='coffee'))PixelScene.talk();
 if(state.won){endTimer=setTimeout(ending,700);}
}
function updateProgress(){let f=state.flags;let n=[f.read,state.inventory.includes('wrench'),f.beltTaken,f.tight,f.belt,state.won].filter(Boolean).length;$('progress').textContent=state.won?'PROLOG ABGESCHLOSSEN':`AUFBRUCH VORBEREITEN · ${n} / 6`;}
function render(){renderRoom();renderVerbs();renderInventory();sentence();updateProgress();}
function popup(html,button='Weiter geht’s'){$('modal-content').innerHTML=html;$('close-modal').textContent=button;if(!$('modal').open)$('modal').showModal();}
function ending(){popup('<div class="eyebrow">PROLOG ABGESCHLOSSEN</div><h2>Nächster Halt: ganz oben.</h2><p>Der Motor hustet, fängt sich und läuft. Du zupfst deinen schwarzen Anzug zurecht. Im Rückspiegel wird der Hof langsam kleiner.</p><p>In deiner Tasche steckt die Adresse deines Onkels.<br>Auf dem Brief steht: <em>„Personaleingang hinten.“</em></p><p><a class="chapter-link" href="act1.html">Akt 1 spielen · Herzlich willkommen.</a></p>','Zurück zum Hof');}
$('help').onclick=()=>popup('<div class="eyebrow">SO SPIELST DU</div><h2>Große Pläne. Kleine Schritte.</h2><p>Wähle unten ein Verb und klicke auf einen Gegenstand in der Szene. Die Figur läuft zuerst zum Ziel und führt die Aktion dort aus. Türen und Ortsnamen führen über die Ausgänge zum nächsten Schauplatz. Klicke auf freien Boden, um nach links, rechts, hinten oder vorne zu gehen.</p><p><strong>Gegenstände benutzen:</strong> Klicke einen Gegenstand in deinen Taschen an, danach sein Ziel in der Szene oder einen zweiten Inventargegenstand. „Schau an“ liest auch das Handbuch.</p><p><strong>Hotspots:</strong> Halte die Leertaste gedrückt oder schalte die Beschriftungen mit dem Knopf im Bild ein. Mit Tab und Enter lassen sich alle Ziele bedienen.</p><p>Dein Ziel: Repariere das Auto und starte es mit dem Schlüssel. „Hinweis“ gibt dir den nächsten passenden Tipp. Dein Fortschritt wird automatisch auf diesem Gerät gespeichert.</p>');
$('close-modal').onclick=()=>$('modal').close();
$('hint').onclick=()=>say(A.hint(state));
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'Ton an':'Ton aus';$('sound').setAttribute('aria-label',sound?'Ton ausschalten':'Ton einschalten');ping();};
$('restart').onclick=()=>{popup('<div class="eyebrow">NOCH EIN VERSUCH?</div><h2>Zurück an den Anfang.</h2><p>Dein bisheriger Spielstand wird ersetzt.</p><button id="confirm-reset">Prolog neu beginnen</button>','Weiterspielen');$('confirm-reset').onclick=()=>{state=A.fresh();verb='Gehe zu';selected=null;clearTimeout(endTimer);actor=Movement.create('yard');save();render();say('Ein schwarzer Anzug, ein großer Plan. Und ein Auto, das anderer Meinung ist.');$('modal').close();};};
$('reveal').onclick=()=>{showAll=!showAll;$('scene').classList.toggle('reveal',showAll);$('reveal').setAttribute('aria-pressed',showAll);};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!$('modal').open&&!['BUTTON','INPUT'].includes(document.activeElement.tagName)){e.preventDefault();$('scene').classList.add('reveal');}if(e.key==='Escape'){Movement.cancel(actor);selected=null;renderInventory();sentence();}});
document.addEventListener('keyup',e=>{if(e.code==='Space')$('scene').classList.toggle('reveal',showAll);});
window.addEventListener('blur',()=>$('scene').classList.toggle('reveal',showAll));
$('scene').onclick=e=>{
 if(e.target.closest('button')||state.won)return;
 const b=$('scene').getBoundingClientRect();
 Movement.move(actor,state.room,{x:(e.clientX-b.left)/b.width*960,y:(e.clientY-b.top)/b.height*540});
 selected=null;renderInventory();sentence();
};
const ctx=$('actors').getContext('2d');
$('actors').width=640;$('actors').height=360;
function frame(t){
 let dt=Math.min(t-lastTime,50);lastTime=t;
 if(!$('modal').open){let arrived=Movement.tick(actor,dt,state.room);if(arrived)completeAction(arrived);}
 PixelScene.render(ctx,state,actor,t);
 // Visible DOM diagnostics also support deterministic movement regression tests.
 $('scene').dataset.actorX=actor.x.toFixed(1);$('scene').dataset.actorY=actor.y.toFixed(1);
 $('scene').dataset.direction=actor.direction;$('scene').dataset.moving=String(actor.moving);
 $('scene').setAttribute('aria-busy',String(actor.moving));
 $('scene').dataset.pending=actor.pending?.target||'';
 $('scene').dataset.objects=JSON.stringify(SceneState.objects(state));
 requestAnimationFrame(frame);
}
render();if(state.won)say('Der Wagen ist repariert. Prolog abgeschlossen! Mit „Neustart“ kannst du noch einmal spielen.');else if(state.inventory.length||Object.keys(state.flags).length)say('Zurück auf dem Land. Deine Taschen und dein Fortschritt sind noch da.');requestAnimationFrame(frame);



