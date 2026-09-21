(function(root){
'use strict';
const items={manual:'Handbuch',key:'Autoschlüssel',wrench:'Schraubenschlüssel',rag:'Putzlappen',dirtybelt:'Öliger Keilriemen',belt:'Keilriemen',coffee:'Kaffee',cup:'Leere Tasse',water:'Tasse Wasser',grounds:'Kaffeepulver'};
const fresh=()=>({room:'yard',inventory:[],flags:{},won:false});
function act(s,verb,target,selected){
 const f=s.flags,has=id=>s.inventory.includes(id),add=id=>{if(!has(id))s.inventory.push(id)},remove=id=>s.inventory=s.inventory.filter(x=>x!==id);
 if(s.won)return 'Der Motor läuft. Die Großstadt wartet!';
 if(selected){
  if(!has(selected))return 'Das habe ich nicht in der Tasche.';
  if(selected==='cup'&&target==='well'){if(f.water)return 'In der Kaffeekanne ist bereits genug Wasser. Die Tasse bleibt zum Einschenken leer.';remove('cup');add('water');return 'Frisches Brunnenwasser. Zurück zur Kaffeekanne in der Küche.';}
  if(selected==='water'&&target==='pot'){if(f.water)return 'In der Kanne ist genug Wasser.';remove('water');add('cup');f.water=true;return 'Wasser eingefüllt. Jetzt noch Kaffeepulver dazu und den Herd anmachen.';}
  if(selected==='grounds'&&target==='pot'){remove('grounds');f.grounds=true;return 'Kaffeepulver eingefüllt. Mit Wasser und eingeschaltetem Herd wird daraus Kaffee.';}
  if(selected==='cup'&&target==='pot'){if(!f.brewed)return 'Erst Wasser und Pulver in die Kanne geben und den Herd anmachen.';if(f.coffeeGiven)return 'Kalle hat seinen Kaffee schon.';remove('cup');add('coffee');return 'Frisch gekochter Kaffee. Den bringe ich Kalle in die Garage.';}
  if(target==='mechanic'&&['cup','water','grounds'].includes(selected))return 'Kalle: „Ich brauche fertigen Kaffee! Wasser und Pulver in die Kanne, Herd an, dann einschenken.“';
  if((selected==='rag'&&target==='dirtybelt')||(selected==='dirtybelt'&&target==='rag')){if(!has('dirtybelt')||!has('rag'))return 'Dafür brauche ich beide Gegenstände.';remove('dirtybelt');add('belt');return 'Einmal gründlich abwischen. Der Keilriemen ist noch richtig gut!';}
  if(selected==='wrench'&&target==='tractor'){if(f.beltTaken)return 'Am Traktor gibt es nichts mehr, das ich brauche.';f.beltTaken=true;add('dirtybelt');return 'Die Halterung ist gelöst. Der Keilriemen passt zu meinem Wagen – wenn das Öl runter ist.';}
  if(target==='car'){
   if(selected==='key'){if(!f.tight||!f.belt)return 'Rrr … klack. Mit diesem Motor komme ich höchstens bis zum Gartentor. Ich sollte unter die Haube schauen.';s.won=true;return 'Er läuft! Auf Wiedersehen, Dorf. Hallo, Karriere. Was soll schon schiefgehen?';}
   if(!f.hood)return 'Erst die Motorhaube öffnen.';
   if(!f.read)return 'Bevor ich etwas kaputt repariere, sollte ich das Handbuch im Haus lesen.';
   if(selected==='wrench'){f.tight=true;return 'Batterieklemme festgezogen. Der Kontakt sitzt wieder.';}
   if(selected==='dirtybelt')return 'Der ist viel zu ölig. Den muss ich erst mit einem Lappen säubern.';
   if(selected==='belt'){f.belt=true;remove('belt');return 'Der Keilriemen sitzt. Jetzt noch den Schlüssel benutzen – sofern die Batterieklemme fest ist.';}
  }
  if(selected==='coffee'&&target==='mechanic'){remove('coffee');f.coffeeGiven=true;return 'Kalle: „Danke! Jetzt darfst du meinen Schraubenschlüssel aus dem Werkzeugkasten nehmen. Am Traktor in der Scheune findest du einen passenden Keilriemen.“';}
  if(selected===target&&selected==='manual'){f.read=true;return manualText();}
  return 'Das passt hier nicht zusammen. Ein guter Plan ist besser als rohe Gewalt.';
 }
 if(target==='manual'&&(verb==='Schau an'||verb==='Benutze'||verb==='Öffne')){f.read=true;return manualText();}
 if(target==='cupboard'&&verb==='Öffne'){f.cupboard=true;return f.grounds||has('grounds')?'Der Küchenschrank ist offen. Das Pulver hast du schon genommen.':'Im offenen Küchenschrank steht Kaffeepulver. Nimm es mit.';}
 if(target==='cupboard'&&verb==='Schließe'){f.cupboard=false;return 'Der Küchenschrank ist wieder geschlossen.';}
 if(target==='stove'&&verb==='Mach an'){if(f.brewed)return 'Der Kaffee ist fertig. Der Herd ist wieder aus.';if(!f.water)return 'Erst Wasser am Brunnen holen und in die Kaffeekanne geben.';if(!f.grounds)return 'Das Kaffeepulver aus dem Küchenschrank fehlt noch in der Kanne.';f.brewed=true;return 'Der Kaffee blubbert und duftet … fertig! Herd aus. Jetzt die leere Tasse mit der Kaffeekanne benutzen.';}
 if(target==='stove'&&verb==='Mach aus')return 'Der Herd ist aus. Nach dem Kochen schalte ich ihn automatisch ab.';
 if(target==='well'&&['Benutze','Drücke','Ziehe','Nimm'].includes(verb))return 'Benutze die leere Tasse aus der Küche mit dem Brunnen, um Wasser zu holen.';
 if(verb==='Nimm'){
  if(target==='cup'){if(has('cup')||has('water')||has('coffee')||f.coffeeGiven)return 'Die Tasse habe ich bereits mitgenommen.';add('cup');return 'Eine leere Tasse. Damit kann ich am Brunnen Wasser holen.';}
  if(target==='grounds'||target==='cupboard'){if(!f.cupboard)return 'Erst den Küchenschrank öffnen.';if(has('grounds')||f.grounds)return 'Das Kaffeepulver habe ich schon genommen.';add('grounds');return 'Kaffeepulver. Das kommt mit Wasser in die Kaffeekanne.';}
  if(target==='coffee')return 'Erst Wasser und Pulver in die Kaffeekanne geben, den Herd anmachen und mit der leeren Tasse einschenken.';
  if(target==='toolbox'&&!f.coffeeGiven)return 'Kalle: „Halt! Erst einen frisch gekochten Kaffee für mich, dann darfst du den Schraubenschlüssel nehmen.“';
  if(['manual','key','rag'].includes(target)){if(has(target)||target==='coffee'&&f.coffeeGiven)return 'Das habe ich schon mitgenommen.';add(target);return ({manual:'Das Handbuch kommt mit. Lesen wäre vermutlich auch eine Idee.',key:'Mein Autoschlüssel. Jetzt fehlt nur noch ein funktionierendes Auto.',rag:'Ein sauberer Putzlappen. Im Anzug will ich mich nicht schmutzig machen.',coffee:'Noch warm. Kalle riecht guten Kaffee auf hundert Meter.'})[target];}
  if(target==='toolbox'){if(!f.toolbox)return 'Der Werkzeugkasten ist noch zu. Öffnen wäre ein Anfang.';if(has('wrench'))return 'Den Schraubenschlüssel habe ich schon.';add('wrench');return 'Ein solider Schraubenschlüssel. Kalle hat ihn mir für die Reparatur geliehen.';}
  if(target==='tractor')return 'Der Keilriemen hängt an einer verschraubten Halterung.';
 }
 if(target==='toolbox'&&verb==='Öffne'){f.toolbox=true;return has('wrench')?'Der Werkzeugkasten ist offen. Den Schraubenschlüssel habe ich bereits eingepackt.':f.coffeeGiven?'Im Werkzeugkasten liegt der Schraubenschlüssel. Kalle hat ihn freigegeben.': 'Im Werkzeugkasten liegt ein Schraubenschlüssel. Vor dem Nehmen braucht Kalle seinen Kaffee.';}
 if(target==='toolbox'&&verb==='Schließe'){f.toolbox=false;return 'Werkzeugkasten geschlossen. Ordnung muss sein.';}
 if(target==='car'&&verb==='Öffne'){f.hood=true;return `Die Haube ist offen: Der Keilriemen ${f.belt?'sitzt':'fehlt'}, die Batterieklemme ${f.tight?'ist fest':'wackelt'}. ${f.read?'Jetzt kann ich am Motor arbeiten.':'Das Handbuch könnte helfen.'}`;}
 if(target==='car'&&verb==='Schließe'){f.hood=false;return 'Die Haube rastet ein.';}
 if(target==='car'&&verb==='Mach an')return has('key')?act(s,'Benutze','car','key'):'Ohne meinen Autoschlüssel wird das nichts. Er hängt noch im Haus.';
 if(target==='car'&&verb==='Mach aus')return 'Das hat der Wagen bereits ganz von selbst erledigt.';
 if(target==='mechanic'&&(verb==='Rede mit'||verb==='Gib'))return f.coffeeGiven?'Kalle: „Werkzeug an die Batterieklemme, sauberen Riemen einsetzen, Schlüssel drehen. Du schaffst das, Chef.“':'Kalle: „Schon im Anzug? Für den Vorstand ist es früh. Erst Kaffee, dann Werkzeug! Wasser gibt es am Brunnen, Pulver im Küchenschrank. Beides in die Kanne geben und den Herd anmachen.“';
 if(target==='hay'&&(verb==='Ziehe'||verb==='Drücke')){f.hay=true;return 'Nur Staub und eine sehr beleidigte Maus. Der alte Traktor sieht nützlicher aus.';}
 if(target==='chest'&&verb==='Öffne'){f.chest=true;return 'Alte Schulfotos. Auf einem steht: „Ich werde mal Chef.“ Wenigstens bin ich konsequent.';}
 if(target==='chest'&&verb==='Schließe'){f.chest=false;return 'Die Truhe ist wieder zu. Die Erinnerungen bleiben sicher verstaut.';}
 if(verb==='Schau an'&&['cup','water','grounds','well','pot','stove','cupboard'].includes(target))return ({cup:'Die leere Tasse eignet sich zum Wasserholen am Brunnen.',water:'Frisches Brunnenwasser für die Kaffeekanne.',grounds:'Kaffeepulver für Kalle.',well:'Frisches Wasser. Benutze die leere Tasse mit dem Brunnen.',pot:f.brewed?'Fertiger Kaffee! Benutze die leere Tasse mit der Kanne.':'Wasser und Kaffeepulver hier einfüllen, danach den Herd anmachen.',stove:'Mit „Mach an“ kochst du den Kaffee, sobald Wasser und Pulver in der Kanne sind.',cupboard:f.cupboard?'Der Küchenschrank ist offen.':'Hier müsste Kaffeepulver sein. Öffne den Küchenschrank.'})[target];
 if(verb==='Schau an')return ({car:f.hood?`Unter der Haube: Batterieklemme ${f.tight?'fest':'locker'}, Keilriemen ${f.belt?'eingesetzt':'fehlt'}.`:'Mein roter Kleinwagen. Viel Charakter. Wenig Zuverlässigkeit.',tractor:f.beltTaken?'Der Traktor hat seinen Keilriemen für einen guten Zweck gespendet.':'Ein ausrangierter Traktor. Sein Keilriemen ist ölig, aber unbeschädigt. Die Halterung ist verschraubt.',toolbox:f.toolbox?'Ein offener Werkzeugkasten. Kalle erlaubt die Entnahme nach seinem Kaffee.':'Kalles Werkzeugkasten. Nicht abgeschlossen.',mechanic:'Kalle, unser Dorfmechaniker. Repariert alles außer seinem Schlafrhythmus.',rag:'Ein erstaunlich sauberer Putzlappen.',key:'Der Schlüssel zu meiner Zukunft. Zumindest zum Auto.',coffee:'Schwarzer Kaffee. Stark genug für zwei Karrieren.',hay:'Heu. Die ländliche Variante eines Aktenstapels.',chest:'Eine alte Truhe voller Erinnerungen.'})[target]||'Das könnte ich mit einem anderen Gegenstand benutzen.';
 if(verb==='Gehe zu')return 'Ich sehe mich hier einmal um.';
 if(verb==='Rede mit')return 'Keine Antwort. Mein Charme funktioniert offenbar nur bei Menschen.';
 return 'Das bringt mich gerade nicht weiter. Anschauen hilft oft – oder den passenden Gegenstand benutzen.';
}
function manualText(){return 'HANDBUCH: „Startprobleme? 1. Batterieklemme mit Schraubenschlüssel festziehen. 2. Sauberen Keilriemen einsetzen. 3. Zündung mit Autoschlüssel starten.“';}
function hint(s){let f=s.flags;if(!f.read)return 'Im Haus liegt ein Reparaturhandbuch auf dem Tisch. Schau es dir an.';if(!f.coffeeGiven&&!s.inventory.includes('wrench')){
 const has=id=>s.inventory.includes(id);
 if(has('coffee'))return 'Gib Kalle in der Garage den frisch gekochten Kaffee.';
 if(!has('cup')&&!has('water'))return 'Nimm die leere Tasse auf der Küchenarbeitsplatte.';
 if(!f.water)return has('water')?'Benutze die Tasse Wasser mit der Kaffeekanne in der Küche.':'Benutze die leere Tasse mit dem Brunnen vorne auf dem Hof.';
 if(!f.grounds)return has('grounds')?'Benutze das Kaffeepulver mit der Kaffeekanne.':f.cupboard?'Nimm das Kaffeepulver aus dem offenen Küchenschrank.':'Öffne den Küchenschrank. Darin findest du Kaffeepulver.';
 if(!f.brewed)return 'Wähle „Mach an“ und klicke auf den Herd.';
 return 'Benutze die leere Tasse mit der Kaffeekanne, dann gib Kalle den Kaffee.';
 }if(!s.inventory.includes('wrench'))return 'In der Garage: Werkzeugkasten öffnen, dann mit „Nimm“ den Schraubenschlüssel einpacken.';if(!f.beltTaken)return 'In der Scheune steckt ein passender Keilriemen am Traktor. Benutze den Schraubenschlüssel damit.';if(s.inventory.includes('dirtybelt'))return s.inventory.includes('rag')?'Klicke den Putzlappen im Inventar an, danach den öligen Keilriemen.':'In der Garage liegt ein Putzlappen. Nimm ihn mit.';if(!f.hood&&(!f.tight||!f.belt))return 'Zurück auf dem Hof: Öffne die Motorhaube des Autos.';if(!f.tight)return 'Benutze den Schraubenschlüssel mit dem geöffneten Auto.';if(!f.belt)return 'Benutze den sauberen Keilriemen mit dem geöffneten Auto.';if(!s.inventory.includes('key'))return 'Der Autoschlüssel hängt im Haus an der Wand.';return 'Benutze den Autoschlüssel mit dem Auto. Die Großstadt wartet!';}
const api={fresh,act,hint,items};if(typeof module!=='undefined')module.exports=api;else root.Adventure=api;
})(typeof window!=='undefined'?window:globalThis);
