const ActOneStory=(()=>{
 let api,conversation=null,intro=null;
 function locked(){return !!intro||!!conversation;}
 function hide(){conversation=null;SceneDialogue.hide();ActOneCast.setSpeaker(null);}
 function showLine(){
  const line=conversation.lines[conversation.index];ActOneCast.setSpeaker(line.speaker);
  SceneDialogue.show(line.text,{speaker:line.speaker,blocking:true,onDone:()=>{
   conversation.index++;if(conversation.index<conversation.lines.length)showLine();else{const done=conversation.done;hide();done?.();}
  }});
 }
 function talk(lines,done){conversation={lines,index:0,done};showLine();}
 function options(){
  const choices=ActOne.options(api.state());if(!choices.length)return;
  conversation={choices:true};ActOneCast.setSpeaker(null);
  SceneDialogue.choices(choices,choice=>{
   talk([{speaker:'hero',text:choice.text}],()=>{
    if(choice.id==='lastSeen'){const lines=ActOne.dialogue(api.state(),'lastSeen');api.save();talk(lines,options);}
   });
  });
 }
 function walter(){const repeat=api.state().flags.walterAsked;const lines=ActOne.dialogue(api.state(),'walter');api.save();talk(lines,repeat?options:null);}
 function reset(){hide();intro=null;ActOneCast.init();}
 function update(dt,t){
  const s=api.state(),hero=api.hero();
  ActOneCast.update(dt,s,locked()||hero.pending?.target==='walter');
  if(!intro&&!s.flags.introDone&&s.room==='lobby'&&!hero.moving&&api.ready()&&!conversation&&ActOneCast.ready){
   const a=Movement.create('lobby'),target=Math.min(1740,hero.x+95);Object.assign(a,{x:Math.max(280,Math.min(900,hero.x+350)),y:452,direction:'left'});ActOneCast.actors.uncle=a;
   Movement.move(a,'lobby',{x:target,y:Math.max(439,hero.y)},{facing:'left'});intro={phase:'approach',elapsed:0};
  }
  if(!intro)return;
  const a=ActOneCast.actors.uncle;
  if(intro.phase==='approach'||intro.phase==='leave'){
   Movement.tick(a,dt,'lobby');if(!a.moving){
    if(intro.phase==='approach'){intro.phase='talk';hero.direction='right';talk(ActOne.dialogue(s,'intro'),()=>{intro.phase='leave';Movement.move(a,'lobby',{x:806,y:432},{facing:'up'});});}
    else{intro.phase='lift';intro.elapsed=0;}
   }
  }else if(intro.phase==='lift'){
   intro.elapsed+=dt;if(intro.elapsed>=1000){s.flags.introDone=true;intro=null;ActOneCast.actors.uncle=null;api.save();api.render();api.say('Mein Onkel ist unterwegs nach oben. Ich sollte mit Walter sprechen.');}
  }
 }
 function init(adapter){api=adapter;ActOneCast.init();
  document.addEventListener('click',e=>{if(locked()&&!e.target.closest('#story-dialogue')){e.preventDefault();e.stopImmediatePropagation();}},true);
  document.addEventListener('keydown',e=>{if(locked()&&!e.target.closest('#story-dialogue')){e.preventDefault();e.stopImmediatePropagation();}},true);
 }
 return {init,update,locked,reset,walter,talk,thanks:()=>talk(ActOne.dialogue(api.state(),'thanks')),get lift(){return intro?.phase==='lift'?{room:'lobby',elapsed:intro.elapsed}:null;},get phase(){return intro?.phase||'';}};
})();
