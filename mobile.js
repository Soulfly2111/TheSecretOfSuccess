(function(root){
'use strict';
const key='success-interface-v1';
let api,active=false,preference='auto',explicit=null,sourceItem=null,sourceVerb='Benutze',room='',portraitDismissed=false;
let rail,panel,content,title,closeButton,status,cancel,rotate,toggle;
const el=(tag,cls,label)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(label)n.textContent=label;return n;};
const button=(label,fn,parent)=>{const b=el('button','',label);b.type='button';b.onclick=fn;parent.append(b);return b;};
function close(){if(panel.open)panel.close();}
function open(label){close();title.textContent=label;content.replaceChildren();panel.showModal();}
function reset(){explicit=null;sourceItem=null;api.selection?.(null);status.textContent='';cancel.hidden=true;}
function pending(label){status.textContent=label;cancel.hidden=false;}
function chooseAction(verb,id){close();reset();api.object(id,verb,null);}
function allActions(id){open(id?api.label(id):'Aktion wählen');for(const v of api.verbs)button(v,()=>{if(id)chooseAction(v,id);else{close();reset();explicit=v;pending(v+' · Ziel antippen');}},content);}
function object(id){
 if(sourceItem){const item=sourceItem,v=sourceVerb;close();reset();api.object(id,v,item);return;}
 if(explicit){const v=explicit;reset();api.object(id,v,null);return;}
 if(api.direct(id)){api.object(id,'Gehe zu',null);return;}
 open(api.label(id));
 for(const v of api.actions(id))button(v,()=>chooseAction(v,id),content);
 button('Weitere Aktionen',()=>allActions(id),content);
}
function inventory(){
 open(sourceItem?'Zielgegenstand wählen':'Inventar');
 const items=api.inventory();if(!items.length)content.append(el('p','','Deine Taschen sind leer.'));
 for(const item of items){const b=button(item.label,()=>{
  if(sourceItem){const from=sourceItem,v=sourceVerb;close();reset();api.item(item.id,v,from);return;}
  open(item.label);for(const v of ['Schau an','Benutze','Gib'])button(v,()=>{
   close();reset();if(v==='Schau an')api.item(item.id,v,null);
   else{sourceItem=item.id;sourceVerb=v;api.selection?.(item.id);pending(v+' '+item.label+' · Ziel antippen');}
  },content);
 },content);b.dataset.item=item.id;}
}
function menu(){
 open('Menü');
 for(const id of ['chapters','journal','help','hint','sound','restart']){const original=document.getElementById(id);if(original)button(original.textContent.trim(),()=>{
  if(id==='help'){
   open('So spielst du mit Touch');
   for(const line of ['Tippe auf den Boden, um zu laufen. Tippe auf ein Objekt und wähle eine Aktion. Die Figur geht zuerst dorthin. Offene Durchgänge werden direkt betreten.',
    'Unter Aktionen findest du alle zwölf Verben. Wähle beispielsweise „Schließe“ und tippe danach auf eine offene Tür.',
    'Inventar: Gegenstand antippen, „Benutze“ oder „Gib“ wählen und danach das Ziel berühren. Für Kombinationen öffnest du das Inventar erneut und wählst den zweiten Gegenstand. „Abbrechen“ hebt die Auswahl auf.',
    'Hotspots markiert die Objekte. Bei überlappenden Zielen wählst du zuerst das gewünschte Objekt. Orte führt die Figur über die bestehenden Wege zum Ziel.',
    'Lange Texte liest du mit „Weiter“. Im Menü findest du Hinweis, Kapitelwahl und die klassische Ansicht. Dein Fortschritt bleibt beim Drehen des Geräts erhalten.'])content.append(el('p','',line));
   return;
  }
  close();original.click();
 },content);}
 button('Klassische Ansicht',()=>setPreference('classic'),content);
}
function setPreference(value){preference=value;try{localStorage.setItem(key,value);}catch{}close();layout();}
function layout(){
 const touch=matchMedia('(any-pointer: coarse)').matches||navigator.maxTouchPoints>0;
 active=preference==='mobile'||(preference==='auto'&&touch&&innerWidth>innerHeight);
 document.body.classList.toggle('mobile-game',active);
 toggle.textContent=active?'Klassische Ansicht':'Mobile Ansicht';
 rail.hidden=!active;toggle.hidden=active;
 rotate.hidden=!touch||innerWidth>innerHeight||portraitDismissed;
 if(!active)close();
 const viewport=root.visualViewport,w=viewport?.width||innerWidth,h=viewport?.height||innerHeight;
 document.documentElement.style.setProperty('--mobile-height',h+'px');
 document.documentElement.style.setProperty('--mobile-width',w+'px');
 // The scene retains its world coordinate system at every orientation and size.
 const area=document.querySelector('.scene-wrap').getBoundingClientRect();
 document.documentElement.style.setProperty('--mobile-scene-width',Math.max(100,Math.min(area.width-16,(area.height-16)*16/9))+'px');
}
function speak(value){SceneDialogue.show(value);}
function init(adapter){
 api=adapter;room=api.room();try{const saved=localStorage.getItem(key);if(['auto','mobile','classic'].includes(saved))preference=saved;}catch{}
 rail=el('nav','mobile-rail');rail.setAttribute('aria-label','Mobile Spielsteuerung');
 for(const [label,fn] of [['Aktionen',()=>allActions()],['Inventar',inventory],['Orte',()=>{open('Orte');for(const r of api.rooms())button(r.label,()=>{close();reset();api.travel(r.id);},content);}],['Hotspots',()=>{const b=document.getElementById('reveal');b.click();rail.querySelector('[data-hotspots]').setAttribute('aria-pressed',b.getAttribute('aria-pressed'));}],['Menü',menu]]){const b=button(label,fn,rail);if(label==='Hotspots')b.dataset.hotspots='true';}
 panel=el('dialog','mobile-panel');panel.id='mobile-panel';title=el('h2');title.id='mobile-panel-title';panel.setAttribute('aria-labelledby',title.id);content=el('div','mobile-panel-content');closeButton=el('button','mobile-close','Zurück');closeButton.onclick=close;panel.append(title,content,closeButton);
 const selection=el('div','mobile-selection');status=el('span');cancel=el('button','','Abbrechen');cancel.hidden=true;cancel.onclick=()=>{reset();api.cancel();};selection.append(status,cancel);
 rotate=el('aside','mobile-rotate');rotate.append(el('span','','Für mehr Platz drehe dein Gerät ins Querformat.'));button('Schließen',()=>{portraitDismissed=true;rotate.hidden=true;},rotate);
 toggle=el('button','mobile-toggle','Mobile Ansicht');toggle.onclick=()=>setPreference(active?'classic':'mobile');document.querySelector('.tools').append(toggle);
 document.body.append(rail,panel,selection,rotate);
 document.getElementById('scene').addEventListener('click',e=>{
  if(!active||e.target.closest('#story-dialogue'))return;
  if(api.busy()){e.stopImmediatePropagation();return;}
  if(e.target.closest('.pan-edge')){reset();return;}
  if(e.target.closest('button:not(.hotspot)'))return;
  const scene=document.getElementById('scene').getBoundingClientRect();
  const candidates=[...document.querySelectorAll('.hotspot:not([hidden])')].filter(b=>{
   const r=b.getBoundingClientRect(),dx=Math.max(0,(44-r.width)/2),dy=Math.max(0,(44-r.height)/2);
   return r.right>scene.left&&r.left<scene.right&&e.clientX>=r.left-dx&&e.clientX<=r.right+dx&&e.clientY>=r.top-dy&&e.clientY<=r.bottom+dy;
  });
  if(!candidates.length){reset();return;}
  e.preventDefault();e.stopImmediatePropagation();
  if(candidates.length===1)object(candidates[0].dataset.object);
  else{open('Welches Objekt?');for(const b of candidates)button(b.getAttribute('aria-label'),()=>{close();object(b.dataset.object);},content);}
 },true);
 new MutationObserver(()=>{if(api.room()!==room){room=api.room();close();reset();}}).observe(document.getElementById('scene'),{attributes:true,attributeFilter:['data-room']});
 document.getElementById('modal').addEventListener('close',()=>{if(active)reset();});
 root.addEventListener('resize',layout);root.visualViewport?.addEventListener('resize',layout);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){close();reset();}});
 layout();
}
root.MobileUI={init,speak,blocking:()=>!!panel?.open};
})(window);
