// Shared scene-bound dialogue for both chapters and input modes.
const SceneDialogue=(()=>{
 const scene=document.getElementById('scene'),box=document.createElement('section');
 box.id='story-dialogue';box.hidden=true;box.setAttribute('aria-label','Gespräch');
 const speaker=document.createElement('strong'),text=document.createElement('p'),buttons=document.createElement('div');
 text.id='speech';text.setAttribute('aria-live','polite');box.append(speaker,text,buttons);scene.append(box);
 const legacy=document.querySelector('.console .dialogue'),initial=legacy.querySelector('#speech');
 const initialText=initial.textContent;initial.remove();document.querySelector('.tools').append(document.getElementById('hint'));legacy.remove();
 let pages=[],page=0,done=null,locked=false,previousFocus=null,objectAction=null;
 function setSpeaker(id,label){const person=Speakers.get(id);box.dataset.speaker=person.id;box.style.setProperty('--speaker-color',person.color);speaker.textContent=label||person.name;}
 function hide(){objectAction=null;const restore=box.contains(document.activeElement);box.hidden=true;locked=false;done=null;buttons.replaceChildren();if(restore&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});}
 function advance(){if(page+1<pages.length){page++;render();}else{const callback=done;hide();callback?.();}}
 function button(label,action){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;buttons.append(b);return b;}
 function render(){const focused=box.contains(document.activeElement);text.textContent=pages[page]||'';buttons.replaceChildren();const next=button(page+1<pages.length||locked?'Weiter':'Schließen',advance);next.className='dialogue-next';if(focused)next.focus({preventScroll:true});if(objectAction)button('Aktionen',objectAction);box.scrollTop=0;}
 function show(value,{speaker:who=null,blocking=false,onDone=null}={}){
  objectAction=null;const match=String(value).match(/^([^:]{1,35}):\s*„([\s\S]*)$/);
  if(match){who=who||match[1];value=match[2].replace(/[“”]$/,'');}
  if(!box.contains(document.activeElement))previousFocus=document.activeElement;
  locked=blocking;done=onDone;setSpeaker(who||'hero',match&&!Speakers.entries[who]&&Speakers.resolve(who)==='hero'?match[1].toUpperCase():null);
  const limit=(document.body.classList.contains("mobile-game")||scene.clientWidth<700)?115:210;pages=[];let part='';
  for(const word of String(value).split(/\s+/)){if(part&&part.length+word.length+1>limit){pages.push(part);part='';}part+=(part?' ':'')+word;}if(part)pages.push(part);
  page=0;box.hidden=false;render();if(blocking)buttons.firstChild.focus({preventScroll:true});
 }
 function choices(items,onSelect){locked=true;done=null;pages=[];setSpeaker('hero');text.textContent='';buttons.replaceChildren();box.hidden=false;
  for(const item of items){const b=button(item.text,()=>onSelect(item));b.className='dialogue-choice';b.dataset.topic=item.id;}
  buttons.firstChild?.focus({preventScroll:true});box.scrollTop=0;
 }
 box.addEventListener('click',e=>{e.stopPropagation();if(!e.target.closest('button')&&pages.length)advance();});
 box.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.target.closest('button')){e.preventDefault();advance();}e.stopPropagation();});
 document.addEventListener('click',e=>{if(e.target.closest('.mobile-rail,#mobile-panel,#modal'))return;if(!locked&&!box.contains(e.target)&&(e.target.closest('button')||scene.contains(e.target)))hide();if(locked&&!box.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('keydown',e=>{if(e.target.closest('.mobile-rail,#mobile-panel,#modal'))return;if(!locked)return;if(e.key==='Enter'&&!box.contains(e.target)&&pages.length){e.preventDefault();advance();}if(!box.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();}},true);
 show(initialText);
 return {show,choices,hide,actions:fn=>{if(!locked&&!box.hidden){objectAction=fn;render();}},get pageIndex(){return box.hidden?0:page;},get locked(){return locked;}};
})();
