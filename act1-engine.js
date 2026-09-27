(function(root){
'use strict';
const items={brochure:'Firmenbroschüre'};
const saveKey='success-act1-exploration-v1',legacyKey='success-act1-v1';
const doorFlags={wc:'wcOpen',sideDoor:'sideOpen',techDoor:'technicalOpen',kitchenDoor:'kitchenOpen'};
const fresh=()=>({version:2,room:'lobby',inventory:[],flags:{},journal:[]});
function restore(saved,legacy,validRooms){
 const source=saved&&typeof saved==='object'?saved:legacy,state=fresh();
 if(!source||typeof source!=='object')return state;
 const candidate=['lodge','vestibule'].includes(source.room)?'lobby':source.room;
 state.room=!source.won&&validRooms.includes(candidate)?candidate:'lobby';
 if(Array.isArray(source.inventory)&&source.inventory.includes('brochure')||source.flags?.brochureTaken){
  state.inventory=['brochure'];state.flags.brochureTaken=true;
  state.journal=['Firmenbroschüre aus der Vitrine: Black Hole Investments & Property Management.'];
 }
 if(saved)for(const flag of Object.values(doorFlags))state.flags[flag]=source.flags?.[flag]===true;
 return state;
}
const descriptions={
 brochure:'Black Hole Investments & Property Management. Das Zentrum der finanziellen Schwerkraft. Sehr bescheidene Ziele.',
 brochureStand:'In der Vitrine neben der Eingangstür liegt eine Firmenbroschüre zum Mitnehmen.',
 entrance:'Durch diese Drehtür bin ich angekommen. Ich sehe mich erst einmal im Gebäude um.',
 phone:'Das Haustelefon am Empfang. Heute klingelt es erfreulich selten.',
 directory:'Büros und Besprechungsraum liegen in der 1. Etage.',
 notice:'Erdgeschoss: Empfang, WC, Technikraum und Lieferhof. 1. Etage: Büros, Besprechungsraum und Officeküche.',
 elevator:'Der Aufzug verbindet das Erdgeschoss mit der 1. Etage.',
 stairs:'Die Treppe verbindet das Erdgeschoss mit der 1. Etage. Bewegung zwischen zwei Sitzungen.',
 wc:'Der Waschraum liegt hinter dieser Tür.',
 techDoor:'Hier geht es in den Technikraum. Die Tür ist nicht abgeschlossen.',
 sideDoor:'Der Nebeneingang führt auf den Lieferhof.',
 extinguisher:'Ein geprüfter Feuerlöscher. Der bleibt für echte Notfälle hier.',
 cooling:'Die Kühlung summt gleichmäßig. Ein angenehm unaufgeregter Mitarbeiter.',
 freight:'Der Lastenaufzug führt in weitere Betriebsbereiche. Die gehören noch nicht zu diesem Rundgang.',
 intercom:'Eine Sprechanlage zwischen Hof und Empfang.',
 deliveryNote:'Eine Lieferung Büromaterial. Die Unterlagen bleiben beim Fahrer.',
 washbasin:'Ein steinernes Waschbecken mit Messinghahn. Fließendes Kapital.',
 mirror:'Der Anzug sitzt. Nur meine Karriere hängt noch etwas schief.',
 towels:'Frisch gefaltet. Hier hat sogar ein Handtuch eine klare Position.',
 paperDispenser:'Papier ohne Antrag in dreifacher Ausfertigung. Erstaunlich.',
 wasteBin:'Ein Hochglanz-Abfalleimer für Papierhandtücher.',
 toilet:'Eine moderne Toilette. Für einmal ist die Zuständigkeit eindeutig.',
 window:'Ein Blick hinaus, weit weg vom nächsten Besprechungstermin.',
 amenities:'Seife, Pflegefläschchen und Tücher. Alles bleibt für die Gäste hier.',
 kitchenDoor:'Hinter dieser Tür liegt die Officeküche.',
 desks:'Monitore, Akten und Schreibtische. Die Büros sind offen zugänglich.',
 meetingTable:'Ein langer Tisch für kurze Entscheidungen und lange Besprechungen.',
 wcSign:'Ein Wegweiser zum WC im Erdgeschoss. Zurück geht es über Treppe oder Aufzug.',
 sink:'Eine Spüle. Die Tassen stehen schon an.',
 coffeeMachine:'Die Kaffeemaschine. Vermutlich die wichtigste Abteilung des Hauses.',
 fridge:'Der Kühlschrank für die gemeinsame Mittagspause.',
 cabinets:'Tassen, Teller und der übliche Vorrat für die Kaffeepause.',
 seating:'Ein kleiner Sitzbereich mit Aussicht auf die Stadt.'
};
const conversations={
 reception:'Empfang: „Willkommen. Die Büros sind in der 1. Etage. Für eine Pause empfehle ich die Officeküche.“',
 walter:'Walter: „Ich kenne hier jede Tür. Schau dich ruhig um. Treppe und Aufzug bringen dich nach oben.“',
 technician:'Technikerin: „Alles läuft. Manchmal ist das schönste Geräusch ein gleichmäßiges Summen.“',
 driver:'Fahrer: „Büromaterial rein, leere Kartons raus. Immerhin weiß ich, wohin meine Arbeit geht.“',
 officeStaff:'Mitarbeiterin: „Willkommen in der 1. Etage. Den besten Ausblick haben wir – die längsten Sitzungen leider auch.“',
 meetingStaff:'Mitarbeiter: „Der Raum ist gerade frei. Ich genieße die Ruhe vor der nächsten Besprechung.“'
};
function act(state,verb,target,item){
 if(item)return item==='brochure'?'Die Broschüre behalte ich zum Nachlesen.':'Diesen Gegenstand habe ich nicht dabei.';
 if(verb==='Nimm'){
  if(target!=='brochureStand')return 'Das bleibt hier. Nur die Firmenbroschüre ist zum Mitnehmen gedacht.';
  if(state.inventory.includes('brochure'))return 'Ein Exemplar reicht. Mehr Papier bedeutet nicht mehr Rendite.';
  state.inventory.push('brochure');state.flags.brochureTaken=true;
  state.journal.push('Firmenbroschüre aus der Vitrine: Black Hole Investments & Property Management.');
  return 'Ich nehme die Firmenbroschüre. Mit „Schau an“ kann ich sie im Inventar aufschlagen.';
 }
 if(verb==='Schau an'){
  if(target==='brochureStand'&&state.flags.brochureTaken)return 'Mein Exemplar liegt im Inventar. Die Vitrine bleibt hier.';
  return descriptions[target]||'Ein Teil des Gebäudes. Ich kann mich hier in Ruhe umsehen.';
 }
 if(conversations[target]&&['Rede mit','Benutze'].includes(verb))return conversations[target];
 const flag=doorFlags[target];
 if(flag){
  if(['Öffne','Drücke','Ziehe'].includes(verb)){state.flags[flag]=true;return 'Die Tür ist offen. Mit „Gehe zu“ geht es hindurch.';}
  if(verb==='Schließe'){state.flags[flag]=false;return 'Die Tür ist geschlossen, aber nicht abgeschlossen.';}
 }
 if(target==='freight')return descriptions.freight;
 if(['Benutze','Mach an','Drücke'].includes(verb)){
  if(target==='washbasin'||target==='sink')return 'Ich wasche mir die Hände. Bereit für saubere Geschäfte.';
  if(target==='toilet')return 'Eine kurze Pause. Die Spülung funktioniert tadellos.';
  if(target==='coffeeMachine')return 'Die Kaffeemaschine brummt zufrieden. Ein vertrautes Bürogeräusch.';
  if(target==='phone')return 'Ich lasse den Empfang ungestört arbeiten.';
  if(target==='intercom')return 'Empfang: „Alles ruhig auf dem Hof? Hier auch.“';
 }
 return 'Ich sehe mich weiter um. Hier gibt es gerade nichts zu erledigen.';
}
function walkExit(state,id){
 if(['stairs','elevator','lobbyExit','upperExit'].includes(id))return true;
 return !!state.flags[doorFlags[id]];
}
function hint(state){
 return ({lobby:'Neben dem Eingang gibt es eine Firmenbroschüre. Treppe und Aufzug führen in die 1. Etage; rechts liegen WC, Technikraum und Hof.',
 upper:'Links liegt die Officeküche. Büros und Besprechungsraum kannst du direkt betreten. Treppe und Aufzug führen ins Erdgeschoss.',
 kitchen:'Sieh dich um. Durch die offene Tür kommst du zurück in die 1. Etage.'})[state.room]||'Die Tür führt zurück ins Erdgeschoss. Die Ortsleiste wählt den passenden Weg.';
}
const api={items,saveKey,legacyKey,doorFlags,fresh,restore,act,walkExit,hint,visible:()=>true,options:()=>[],canEnter:()=>''};
if(typeof module!=='undefined')module.exports=api;else root.ActOne=api;
})(typeof window!=='undefined'?window:globalThis);
