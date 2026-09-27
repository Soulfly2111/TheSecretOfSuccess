(function(root){
'use strict';
const items={brochure:'Firmenbroschüre'};
const saveKey='success-act1-exploration-v1',legacyKey='success-act1-v1';
const doorFlags={wc:'wcOpen',sideDoor:'sideOpen',techDoor:'technicalOpen',kitchenDoor:'kitchenOpen',officeDoor:'officeOpen',emsDoor:'emsOpen',loungeDoor:'loungeOpen'};
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
 notice:'Erdgeschoss: Empfang, WC, Technikraum und Lieferhof. 1. Etage: Büros, Besprechungsraum und Officeküche. 2. Etage: Teamleiterbüro, Kopierer, EMS-Training und Pausenraum.',
 elevator:'Der Aufzug hält im Erdgeschoss, in der 1. Etage und in der 2. Etage. Am Aufzug wähle ich mein Ziel.',
 stairs:'Der beschilderte Abgang verbindet diese Etage mit der darunter. Im Erdgeschoss führt die Treppe nach oben.',
 stairsUp:'Dieser Aufgang führt von der 1. Etage in die 2. Etage.',
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
 seating:'Ein kleiner Sitzbereich mit Aussicht auf die Stadt.',
 officeDoor:'Die Tür zum Einzelbüro des Teamleiters. Nicht abgeschlossen.',
 emsDoor:'Die Tür zum EMS-Trainingsraum. Ein kleiner Ausgleich zur Büroarbeit.',
 loungeDoor:'Hinter dieser Tür liegt der Pausenraum mit seinen Sofas.',
 copier:'Ein Kopierer mit erstaunlich vielen Tasten für eine einzige Aufgabe.',
 fax:'Ein Faxgerät. Hier reist die Zukunft noch auf Papier.',
 paperShelf:'Papier und Ordner, ordentlich sortiert. Alles bleibt für die Kollegen hier.',
 waterDispenser:'Ein Wasserspender. Die klarste Entscheidung auf dieser Etage.',
 floorGuide:'WC: Erdgeschoss. Besprechungsraum: 1. Etage. Treppe und Aufzug führen dorthin.',
 teamDesk:'Der Schreibtisch des Teamleiters. Zwischen zwei Akten passt noch eine Entscheidung.',
 teamComputer:'Ein Computer mit Tabellen. Der Bildschirm arbeitet fleißiger als der Bildschirmschoner.',
 teamFiles:'Ein Aktenschrank voller Vorgänge. Heute muss ich keinen davon bearbeiten.',
 visitorChair:'Ein Besucherstuhl. Vermutlich für die kurzen Gespräche, die länger dauern.',
 emsConsole:'Ein EMS-Trainingsgerät mit Anschlussleitungen. Der Trainer kümmert sich um die Bedienung.',
 trainingVest:'Eine Trainingsweste mit Elektroden. Die bleibt am Gerät.',
 trainingMat:'Eine blaue Trainingsmatte. Hier ist Platz für Bewegung.',
 locker:'Ein Spind für die Trainingssachen.',
 weights:'Hanteln, ordentlich im Ständer. Für heute reicht mir das Treppensteigen.',
 redSofa:'Ein rotes Sofa. Offiziell für Pausen, inoffiziell für gute Ideen.',
 greenSofa:'Das grüne Sofa bietet einen besonders guten Blick aus dem Fenster.',
 coffeeTable:'Zeitschriften und Tassen. Eine Tagesordnung liegt hier zum Glück nicht.',
 beanbag:'Ein blauer Sitzsack ohne erkennbare Führungsverantwortung.',
 guitar:'Eine Gitarre für die Pause. Ich lasse sie an ihrem Platz.'
};
const conversations={
 reception:'Empfang: „Willkommen. Die Büros sind in der 1. Etage. Für eine Pause empfehle ich die Officeküche.“',
 walter:'Walter: „Ich kenne hier jede Tür. Schau dich ruhig um. Treppe und Aufzug bringen dich nach oben.“',
 technician:'Technikerin: „Alles läuft. Manchmal ist das schönste Geräusch ein gleichmäßiges Summen.“',
 driver:'Fahrer: „Büromaterial rein, leere Kartons raus. Immerhin weiß ich, wohin meine Arbeit geht.“',
 officeStaff:'Mitarbeiterin: „Willkommen in der 1. Etage. Den besten Ausblick haben wir – die längsten Sitzungen leider auch.“',
 meetingStaff:'Mitarbeiter: „Der Raum ist gerade frei. Ich genieße die Ruhe vor der nächsten Besprechung.“',
 teamLeader:'Teamleiter: „Willkommen. Schau dich ruhig um. Mein Büro ist klein, die Ablage dafür ehrgeizig.“',
 copyStaff:'Mitarbeiterin: „Der Kopierer läuft heute tadellos. Ich will es lieber nicht zu laut sagen.“',
 trainer:'Trainer: „Hier machen die Kollegen Bewegungspause. Du kannst dich gern umsehen; die Geräte bediene ich.“',
 breakStaff:'Mitarbeiterin: „Eine Tasse Kaffee und fünf Minuten Ruhe. Manche nennen das schon Unternehmenskultur.“'
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
  if(target==='copier')return 'Ein leises Surren. Der Kopierer ist bereit, aber ich habe nichts zu kopieren.';
  if(target==='waterDispenser')return 'Ein Schluck Wasser. Ganz ohne Besprechung.';
  if(target==='emsConsole')return 'Die Bedienung überlasse ich dem Trainer. Ich bin nur auf einem Rundgang.';
  if(target==='phone')return 'Ich lasse den Empfang ungestört arbeiten.';
  if(target==='intercom')return 'Empfang: „Alles ruhig auf dem Hof? Hier auch.“';
 }
 return 'Ich sehe mich weiter um. Hier gibt es gerade nichts zu erledigen.';
}
function walkExit(state,id){
 if(['stairs','stairsUp','elevator','lobbyExit','upperExit','secondExit'].includes(id))return true;
 return !!state.flags[doorFlags[id]];
}
function hint(state){
 return ({lobby:'Neben dem Eingang gibt es eine Firmenbroschüre. Treppe und Aufzug verbinden die drei Etagen; rechts liegen WC, Technikraum und Hof.',
 upper:'Links liegt die Officeküche. Büros und Besprechungsraum kannst du direkt betreten. Die Treppe führt nach unten ins Erdgeschoss und nach oben in die 2. Etage. Im Aufzug wählst du die Etage.',
 second:'Der Kopierraum ist offen. Büro, EMS-Training und Pausenraum liegen hinter den beschrifteten Türen. Der Treppenabgang führt in die 1. Etage.',
 teamOffice:'Durch die Tür geht es zurück in die 2. Etage. Hier gibt es gerade keine Aufgaben.',
 ems:'Die Matte ist begehbar. Durch die Tür kommst du zurück in die 2. Etage.',
 lounge:'Die Kollegen genießen ihre Pause. Die Tür führt zurück in die 2. Etage.',
 kitchen:'Sieh dich um. Durch die offene Tür kommst du zurück in die 1. Etage.'})[state.room]||'Die Tür führt zurück ins Erdgeschoss. Die Ortsleiste wählt den passenden Weg.';
}
const api={items,saveKey,legacyKey,doorFlags,fresh,restore,act,walkExit,hint,visible:()=>true,options:()=>[],canEnter:()=>''};
if(typeof module!=='undefined')module.exports=api;else root.ActOne=api;
})(typeof window!=='undefined'?window:globalThis);
