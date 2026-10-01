(function(root){
'use strict';
let hoverTip,holdRing,gesture=null,suppressClickUntil=0,inspection=null,discardTouchClick=false;
let api,panel,title,content,closeButton,rail,status,selection,room,source=null,sourceVerb='Benutze',anchor=null,mode='',holding=false;
const el=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
const paths={menu:'M9 2h6l1 4 3 2 4-1 3 5-3 3v3l3 3-3 5-4-1-3 2-1 4H9l-1-4-3-2-4 1-3-5 3-3v-3l-3-3 3-5 4 1 3-2z',bag:'M7 9V6h14v3M3 10h22v17H3zM3 16h22M11 14h6v5h-6z',search:'M18 18l9 9M20 11a9 9 0 1 1-18 0 9 9 0 0 1 18 0',eye:'M2 15q12-16 24 0-12 16-24 0M18 15a4 4 0 1 1-8 0 4 4 0 0 1 8 0',hand:'M8 26V13q0-3 3-1V5q3-3 4 0v8V4q4-2 4 2v8V7q4-2 4 2v10l-5 8z',walk:'M9 3l-3 8 5 2 2-8zM19 14l-3 8 5 2 2-8z',talk:'M2 4h24v16H13l-7 6v-6H2zM7 11h2m4 0h2m4 0h2',door:'M5 27V3h19v24M8 26V6l12-2v22zM15 15h2',power:'M14 2v13M7 7a11 11 0 1 0 14 0'};
function icon(type){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','-3 0 34 32');s.setAttribute('aria-hidden','true');s.innerHTML='<path d="'+(paths[type]||paths.hand)+'"/>';if(type==='menu')s.innerHTML+='<circle cx="12" cy="16" r="5"/>';return s;}
function button(label,fn,parent=content,type){const b=el('button','',label);b.type='button';if(type)b.prepend(icon(type));b.onclick=fn;parent.append(b);return b;}
function reveal(on){holding=on;document.getElementById('scene').classList.toggle('reveal',on);rail?.querySelector('[data-hotspots]')?.setAttribute('aria-pressed',String(on));}
function reset(){source=null;api.selection?.(null);selection.hidden=true;status.textContent='';}
function close(){reveal(false);if(panel.open)panel.close();mode='';}
function open(label,kind='menu'){clearHover();cancelHold();close();mode=kind;panel.className='adventure-panel '+kind+'-panel';title.textContent=label;content.replaceChildren();closeButton.textContent=kind==='inventory'?'Inventar schließen':kind==='wheel'?'Abbrechen':'Schließen';panel.showModal();layout();}
function wheel(id,point){
 if(source){const item=source,v=sourceVerb;reset();api.object(id,v,item);return;}
 anchor=point;open(api.label(id),'wheel');
 const actions=[...new Set(api.actions(id))].slice(0,6),symbols={'Schau an':'eye','Gehe zu':'walk','Rede mit':'talk','Öffne':'door','Schließe':'door','Mach an':'power','Mach aus':'power'};
 panel.style.setProperty('--wheel-sector',(360/actions.length)+'deg');panel.style.setProperty('--wheel-start',(-180/actions.length)+'deg');
 actions.forEach((verb,i)=>{const b=button(verb,()=>{close();execute(id,verb);},content,symbols[verb]||'hand');b.dataset.action=verb;const angle=(-90+i*360/actions.length)*Math.PI/180;b.style.setProperty('--ax',Math.cos(angle));b.style.setProperty('--ay',Math.sin(angle));});
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
 button('Hilfe',()=>{open('Hilfe');for(const text of ['Linksklick oder kurzes Antippen: zum Objekt gehen und anschauen. Offene Durchgänge werden direkt betreten. Rechtsklick oder 500 Millisekunden Halten: weitere Aktionen im Rad. Bewege den Finger, um das Halten abzubrechen.','Freien Boden antippen bewegt die Figur. In breiten Etagen weiter zum Bildrand gehen; die Kamera folgt. Türen, Treppen und Aufzüge verbinden die Räume.','Wähle im Inventar einen Gegenstand und „Benutze“ oder „Gib“. Tippe danach direkt auf das Ziel. Für Kombinationen öffnest du das Inventar erneut.','Halte die Lupe oder am PC die Leertaste, um Hotspots zu sehen. Escape schließt Menüs oder bricht eine Gegenstandsauswahl ab.'])content.append(el('p','',text));button('Rätselhinweis',()=>{open('Rätselhinweise');for(const hint of api.hints()){button(hint.label,()=>{open(hint.label);content.append(el('p','',hint.text));});}});});
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
 const scene=document.getElementById('scene');
 hoverTip=el('div','object-tooltip');hoverTip.hidden=true;holdRing=el('div','hold-progress');holdRing.hidden=true;document.body.append(hoverTip,holdRing);
 const candidates=(point,touch=false)=>[...scene.querySelectorAll('.hotspot:not([hidden])')].filter(b=>{const r=b.getBoundingClientRect(),sr=scene.getBoundingClientRect(),dx=touch?Math.max(0,(44-r.width)/2):0,dy=touch?Math.max(0,(44-r.height)/2):0;return r.right>sr.left&&r.left<sr.right&&point.x>=Math.max(sr.left,r.left-dx)&&point.x<=Math.min(sr.right,r.right+dx)&&point.y>=Math.max(sr.top,r.top-dy)&&point.y<=Math.min(sr.bottom,r.bottom+dy);});
 function choose(list,point,radial,touch){if(!list.length)return;const run=id=>{if(source){const item=source,v=sourceVerb;reset();api.object(id,v,item);}else if(radial)wheel(id,point);else{execute(id,api.defaultAction(id));if(touch){const key='success-touch-help-'+(document.querySelector('#journal')?'act1':'prolog');try{if(!localStorage.getItem(key)){localStorage.setItem(key,'1');const hint=el('div','touch-help','Gedrückt halten für weitere Aktionen');document.body.append(hint);setTimeout(()=>hint.remove(),4500);}}catch{}}}};if(list.length===1)run(list[0].dataset.object);else{open('Welches Objekt?','choice');for(const b of list)button(b.getAttribute('aria-label'),()=>{close();run(b.dataset.object);});}}
 scene.addEventListener('pointermove',e=>{if(gesture&&e.pointerId===gesture.id&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>12)cancelHold();if(e.pointerType!=='mouse')return;if(panel.open||api.busy()||SceneDialogue.locked){clearHover();return;}const list=candidates({x:e.clientX,y:e.clientY});if(list.length)showHover(list[0].dataset.object,{x:e.clientX,y:e.clientY});else clearHover();});
 scene.addEventListener('pointerleave',clearHover);
 document.addEventListener('pointerdown',e=>{if(gesture&&e.pointerId!==gesture.id)cancelHold();else if(!gesture)discardTouchClick=false;},true);
 document.addEventListener('click',e=>{if(discardTouchClick){discardTouchClick=false;e.preventDefault();e.stopImmediatePropagation();}},true);
 scene.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||panel.open||api.busy()||SceneDialogue.locked||e.target.closest('#story-dialogue'))return;const point={x:e.clientX,y:e.clientY},list=candidates(point,true);if(!list.length||source)return;gesture={id:e.pointerId,x:point.x,y:point.y};showHover(list[0].dataset.object,point);holdRing.hidden=false;holdRing.style.left=(point.x-18)+'px';holdRing.style.top=(point.y-18)+'px';holdRing.style.animation='none';void holdRing.offsetWidth;holdRing.style.animation='hold-fill .5s linear forwards';gesture.timer=setTimeout(()=>{discardTouchClick=true;suppressClickUntil=Date.now()+1000;choose(list,point,true,true);},500);});
 document.addEventListener('pointerup',()=>{cancelHold(false);},true);
 document.addEventListener('pointercancel',()=>cancelHold(),true);
 scene.addEventListener('click',e=>{if(e.target.closest('#story-dialogue'))return;if(api.busy()||SceneDialogue.locked){e.stopImmediatePropagation();return;}if(e.target.closest('button:not(.hotspot)'))return;inspection=null;clearHover();const point={x:e.clientX,y:e.clientY},touch=e.pointerType==='touch',list=candidates(point,touch);if(!list.length){reset();return;}e.preventDefault();e.stopImmediatePropagation();choose(list,point,false,touch);},true);
 const context=e=>{e.preventDefault();e.stopImmediatePropagation();if(e.pointerType==='touch'||e.sourceCapabilities?.firesTouchEvents||gesture||Date.now()<suppressClickUntil)return;clearHover();if(source){reset();api.cancel();return;}if(panel.open){close();return;}if(api.busy()||SceneDialogue.locked||document.getElementById('modal').open)return;const point={x:e.clientX,y:e.clientY};choose(candidates(point),point,true,false);};
 scene.addEventListener('contextmenu',context,true);panel.addEventListener('contextmenu',context);rail.addEventListener('contextmenu',context);document.getElementById('modal').addEventListener('contextmenu',e=>e.preventDefault());
 scene.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key==='F10'&&e.shiftKey)&&e.target.matches('.hotspot')){e.preventDefault();e.stopImmediatePropagation();if(!api.busy()&&!SceneDialogue.locked){const r=e.target.getBoundingClientRect();choose([e.target],{x:r.left+r.width/2,y:r.top+r.height/2},e.key==='F10',false);}}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(panel.open){e.preventDefault();e.stopImmediatePropagation();close();}else if(source){e.preventDefault();e.stopImmediatePropagation();reset();api.cancel();}return;}if(panel.open){e.stopPropagation();return;}if(e.code==='Space'&&!document.getElementById('modal').open&&!e.target.closest('button')){e.preventDefault();e.stopImmediatePropagation();reveal(true);}},true);
 document.addEventListener('keyup',e=>{if(e.code==='Space'){reveal(false);e.stopImmediatePropagation();}},true);
 window.addEventListener('blur',()=>{reveal(false);cancelHold();clearHover();});document.addEventListener('visibilitychange',()=>{reveal(false);cancelHold();clearHover();});
 new MutationObserver(()=>{if(api.room()!==room){room=api.room();inspection=null;clearHover();cancelHold();close();reset();}}).observe(scene,{attributes:true,attributeFilter:['data-room']});
 new MutationObserver(()=>{if(document.getElementById('modal').open){reveal(false);clearHover();cancelHold();close();}}).observe(document.getElementById('modal'),{attributes:true,attributeFilter:['open']});
 const resized=()=>{clearHover();cancelHold();layout();};window.addEventListener('resize',resized);window.visualViewport?.addEventListener('resize',resized);layout();
}
function clearHover(){if(hoverTip)hoverTip.hidden=true;}
function showHover(id,point){hoverTip.textContent=api.label(id);hoverTip.hidden=false;const s=document.getElementById('scene').getBoundingClientRect();hoverTip.style.maxWidth=Math.max(100,s.width-20)+'px';const r=hoverTip.getBoundingClientRect();hoverTip.style.left=Math.max(s.left+6,Math.min(s.right-r.width-6,point.x-r.width/2))+'px';hoverTip.style.top=Math.max(s.top+6,Math.min(s.bottom-r.height-6,point.y-r.height-20))+'px';}
function cancelHold(suppress=true){if(!gesture)return;clearTimeout(gesture.timer);gesture=null;holdRing.hidden=true;clearHover();if(suppress){discardTouchClick=true;suppressClickUntil=Date.now()+800;}}
function execute(id,verb){inspection=null;SceneDialogue.hide();api.object(id,verb,null);}
function inspected(id){if(!document.querySelector('.hotspot[data-object="'+id+'"]'))return;inspection={id,room:api.room()};SceneDialogue.actions(()=>{if(inspection?.room!==api.room())return;const b=document.querySelector('.hotspot[data-object="'+id+'"]');if(!b)return;const r=b.getBoundingClientRect();wheel(id,{x:r.left+r.width/2,y:r.top+r.height/2});});}
root.MobileUI={init,inspected,speak:value=>SceneDialogue.show(value),blocking:()=>!!panel?.open};
})(window);
