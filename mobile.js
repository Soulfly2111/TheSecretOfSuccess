(function(root){
'use strict';
let api,panel,title,content,closeButton,rail,status,selection,room,source=null,sourceVerb='Benutze',anchor=null,mode='',holding=false;
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
const paths={menu:'M9 2h6l1 4 3 2 4-1 3 5-3 3v3l3 3-3 5-4-1-3 2-1 4H9l-1-4-3-2-4 1-3-5 3-3v-3l-3-3 3-5 4 1 3-2z',bag:'M7 9V6h14v3M3 10h22v17H3zM3 16h22M11 14h6v5h-6z',search:'M18 18l9 9M20 11a9 9 0 1 1-18 0 9 9 0 0 1 18 0',eye:'M2 15q12-16 24 0-12 16-24 0M18 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0',hand:'M8 26V13q0-3 3-1V5q3-3 4 0v8V4q4-2 4 2v8V7q4-2 4 2v10l-5 8z',walk:'M9 3l-3 8 5 2 2-8zM19 14l-3 8 5 2 2-8z',talk:'M2 4h24v16H13l-7 6v-6H2zM7 11h2m4 0h2m4 0h2',door:'M5 27V3h19v24M8 26V6l12-2v22zM15 15h2',power:'M14 2v13M7 7a11 11 0 1 0 14 0'};
function icon(type){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','-3 0 34 32');s.setAttribute('aria-hidden','true');s.innerHTML='<path d="'+(paths[type]||paths.hand)+'"/>';if(type==='menu')s.innerHTML+='<circle cx="12" cy="16" r="5"/>';return s;}
function button(label,fn,parent=content,type){const b=el('button','',label);b.type='button';if(type)b.prepend(icon(type));b.onclick=fn;parent.append(b);return b;}
function reveal(on){holding=on;document.getElementById('scene').classList.toggle('reveal',on);rail?.querySelector('[data-hotspots]')?.setAttribute('aria-pressed',String(on));}
function reset(){source=null;api.selection?.(null);selection.hidden=true;status.textContent='';}
function close(){reveal(false);if(panel.open)panel.close();mode='';}
function open(label,kind='menu'){close();mode=kind;panel.className='adventure-panel '+kind+'-panel';title.textContent=label;content.replaceChildren();closeButton.textContent=kind==='inventory'?'Inventar schließen':kind==='wheel'?'Abbrechen':'Schließen';panel.showModal();layout();}
function wheel(id,point){
 if(source){const item=source,v=sourceVerb;reset();api.object(id,v,item);return;}
 anchor=point;open(api.label(id),'wheel');
 const actions=[...new Set(api.actions(id))].slice(0,6),symbols={'Schau an':'eye','Gehe zu':'walk','Rede mit':'talk','Öffne':'door','Schließe':'door','Mach an':'power','Mach aus':'power'};
 panel.style.setProperty('--wheel-sector',(360/actions.length)+'deg');panel.style.setProperty('--wheel-start',(-180/actions.length)+'deg');
 actions.forEach((verb,i)=>{const b=button(verb,()=>{close();api.object(id,verb,null);},content,symbols[verb]||'hand');b.dataset.action=verb;const angle=(-90+i*360/actions.length)*Math.PI/180;b.style.setProperty('--ax',Math.cos(angle));b.style.setProperty('--ay',Math.sin(angle));});
 layout();content.querySelector('button')?.focus({preventScroll:true});
}
function inventory(){
 if(api.busy()||SceneDialogue.locked)return;
 open(source?'Zielgegenstand wählen':'Inventar','inventory');const items=api.inventory();
 if(!items.length)content.append(el('p','','Deine Taschen sind leer.'));
 for(const item of items){const b=button(item.label,()=>{
  if(source){const from=source,v=sourceVerb;close();reset();api.item(item.id,v,from);return;}
  open(item.label,'inventory');const c=el('canvas','item-preview');c.width=c.height=24;api.drawItem?.(c,item.id);content.append(c);
  for(const v of (api.itemActions?.(item.id)||['Schau an','Benutze','Gib']))button(v,()=>{close();reset();if(v==='Schau an')api.item(item.id,v,null);else{source=item.id;sourceVerb=v;api.selection?.(item.id);status.textContent=v+' '+item.label+' · Ziel wählen';selection.hidden=false;}});
  button('Zurück zum Inventar',inventory);
 },content);b.dataset.item=item.id;const c=el('canvas');c.width=c.height=24;api.drawItem?.(c,item.id);b.prepend(c);}
}
function invoke(id){close();document.getElementById(id)?.onclick?.();}
function menu(){open('Menü');const loc=el('div','menu-location');loc.append(el('p','',document.getElementById('location-sub').textContent),el('h3','',document.getElementById('location-name').textContent));content.append(loc);
 button('Kapitelauswahl',()=>invoke('chapters'));
 button('Notizbuch',()=>{if(document.getElementById('journal'))invoke('journal');else{open('Notizbuch');for(const line of api.journal?.()||[])content.append(el('p','',line));}});
 button(document.getElementById('sound').textContent==='Ton an'?'Ton ausschalten':'Ton einschalten',()=>{document.getElementById('sound').onclick?.();menu();});
 button('Hilfe',()=>{open('Hilfe');for(const text of ['Tippe oder klicke auf ein Objekt. Im Aktionsrad erscheinen passende Verben. Die Figur geht vor der Aktion zum Ziel.','Freien Boden antippen bewegt die Figur. In breiten Etagen weiter zum Bildrand gehen; die Kamera folgt. Türen, Treppen und Aufzüge verbinden die Räume.','Wähle im Inventar einen Gegenstand und „Benutze“ oder „Gib“. Tippe danach direkt auf das Ziel. Für Kombinationen öffnest du das Inventar erneut.','Halte die Lupe oder am PC die Leertaste, um Hotspots zu sehen. Escape schließt Menüs oder bricht eine Gegenstandsauswahl ab.'])content.append(el('p','',text));button('Rätselhinweis',()=>{open('Rätselhinweise');for(const hint of api.hints()){button(hint.label,()=>{open(hint.label);content.append(el('p','',hint.text));});}});});
 button('Neustart',()=>invoke('restart'));
}
function layout(){
 const v=window.visualViewport,w=v?.width||innerWidth,h=v?.height||innerHeight;document.documentElement.style.setProperty('--mobile-height',h+'px');document.documentElement.style.setProperty('--mobile-width',w+'px');
 const wrap=document.querySelector('.scene-wrap').getBoundingClientRect(),width=Math.min(wrap.width,wrap.height*16/9);document.documentElement.style.setProperty('--mobile-scene-width',Math.max(1,width)+'px');
 const s=document.getElementById('scene').getBoundingClientRect();rail.style.cssText=`left:${s.right-62}px;top:${s.top+10}px;height:${Math.max(164,s.height-20)}px`;
 selection.style.left=(s.left+8)+'px';selection.style.top=(s.top+8)+'px';selection.style.maxWidth=Math.max(100,s.width-90)+'px';
 if(mode==='wheel'){const size=Math.max(160,Math.min(306,s.height-12,s.width-76));panel.style.width=panel.style.height=size+'px';const x=anchor?.x??s.left+s.width/2,y=anchor?.y??s.top+s.height/2;panel.style.left=Math.max(s.left+6,Math.min(s.right-size-6,x-size/2))+'px';panel.style.top=Math.max(s.top+6,Math.min(s.bottom-size-6,y-size/2))+'px';}
 else if(mode==='inventory'){panel.style.width=Math.min(290,Math.max(220,s.width*.3),w-82)+'px';panel.style.height=Math.max(110,s.height-24)+'px';panel.style.left='auto';panel.style.right=Math.max(8,w-s.right+68)+'px';panel.style.top=(s.top+12)+'px';}
 else{panel.style.cssText='';}
}
function init(adapter){
 api=adapter;room=api.room();document.body.classList.add('mobile-game','unified-game');
 rail=el('nav','mobile-rail');rail.setAttribute('aria-label','Spielsteuerung');
 button('',menu,rail,'menu').setAttribute('aria-label','Menü');button('',inventory,rail,'bag').setAttribute('aria-label','Inventar');
 const magnifier=button('',()=>{},rail,'search');magnifier.setAttribute('aria-label','Hotspots gedrückt halten');magnifier.dataset.hotspots='true';magnifier.onpointerdown=e=>{if(api.busy()||panel.open)return;e.preventDefault();magnifier.setPointerCapture(e.pointerId);reveal(true);};for(const type of ['pointerup','pointercancel','lostpointercapture'])magnifier.addEventListener(type,()=>reveal(false));magnifier.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();reveal(true);}});magnifier.addEventListener('keyup',()=>reveal(false));magnifier.addEventListener('blur',()=>reveal(false));
 panel=el('dialog','adventure-panel');panel.id='mobile-panel';title=el('h2');title.id='mobile-panel-title';panel.setAttribute('aria-labelledby',title.id);content=el('div','mobile-panel-content');closeButton=button('Schließen',close,panel);panel.prepend(title,content);
 panel.addEventListener('click',e=>{const r=panel.getBoundingClientRect();if(e.target===panel&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))close();});panel.addEventListener('cancel',e=>{e.preventDefault();close();});
 selection=el('div','mobile-selection');selection.hidden=true;status=el('span');selection.append(status);button('Abbrechen',()=>{reset();api.cancel();},selection);document.body.append(rail,panel,selection);
 const scene=document.getElementById('scene');scene.addEventListener('click',e=>{
  if(e.target.closest('#story-dialogue'))return;if(api.busy()||SceneDialogue.locked){e.stopImmediatePropagation();return;}
  if(e.target.closest('button:not(.hotspot)'))return;
  const sr=scene.getBoundingClientRect(),point={x:e.clientX,y:e.clientY};
  const candidates=[...scene.querySelectorAll('.hotspot:not([hidden])')].filter(b=>{const r=b.getBoundingClientRect(),dx=Math.max(0,(44-r.width)/2),dy=Math.max(0,(44-r.height)/2);return r.right>sr.left&&r.left<sr.right&&point.x>=r.left-dx&&point.x<=r.right+dx&&point.y>=r.top-dy&&point.y<=r.bottom+dy;});
  if(!candidates.length){reset();return;}e.preventDefault();e.stopImmediatePropagation();
  if(candidates.length===1)wheel(candidates[0].dataset.object,point);else{open('Welches Objekt?','choice');for(const b of candidates)button(b.getAttribute('aria-label'),()=>{close();wheel(b.dataset.object,point);});}
 },true);
 // Keyboard activation on a hotspot has no pointer coordinates.
 scene.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)&&e.target.matches('.hotspot')){e.preventDefault();e.stopImmediatePropagation();if(!api.busy()&&!SceneDialogue.locked){const r=e.target.getBoundingClientRect();wheel(e.target.dataset.object,{x:r.left+r.width/2,y:r.top+r.height/2});}}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(panel.open){e.preventDefault();e.stopImmediatePropagation();close();}else if(source){e.preventDefault();e.stopImmediatePropagation();reset();api.cancel();}return;}if(panel.open){e.stopPropagation();return;}if(e.code==='Space'&&!document.getElementById('modal').open&&!e.target.closest('button')){e.preventDefault();e.stopImmediatePropagation();reveal(true);}},true);
 document.addEventListener('keyup',e=>{if(e.code==='Space'){reveal(false);e.stopImmediatePropagation();}},true);
 window.addEventListener('blur',()=>reveal(false));document.addEventListener('visibilitychange',()=>reveal(false));
 new MutationObserver(()=>{if(api.room()!==room){room=api.room();close();reset();}}).observe(scene,{attributes:true,attributeFilter:['data-room']});
 new MutationObserver(()=>{if(document.getElementById('modal').open){reveal(false);close();}}).observe(document.getElementById('modal'),{attributes:true,attributeFilter:['open']});
 window.addEventListener('resize',layout);window.visualViewport?.addEventListener('resize',layout);layout();
}
root.MobileUI={init,speak:value=>SceneDialogue.show(value),blocking:()=>!!panel?.open};
})(window);
