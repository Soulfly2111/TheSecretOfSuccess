(function(root){
'use strict';
const items={brochure:'Firmenbroschüre',knife:'Tafelmesser',keycard:'Walters Schlüsselkarte'};
const questFlags=['cleaningLightOn','introDone','walterAsked','wcClue','cardSeen','drawerOpen','knifeTaken','cardTaken','cardReturned'];
const saveKey='success-act1-exploration-v1',legacyKey='success-act1-v1';
const doorFlags={wc:'wcOpen',sideDoor:'sideOpen',techDoor:'technicalOpen',kitchenDoor:'kitchenOpen',officeDoor:'officeOpen',emsDoor:'emsOpen',loungeDoor:'loungeOpen'};
const fresh=()=>({version:3,room:'lobby',inventory:[],flags:{},journal:[]});
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
 if(saved){
  for(const flag of questFlags)state.flags[flag]=source.flags?.[flag]===true;
  for(const item of ['knife','keycard'])if(source.inventory?.includes(item))state.inventory.push(item);
  if(state.inventory.includes('knife'))state.flags.knifeTaken=true;
  if(state.inventory.includes('keycard'))state.flags.cardTaken=state.flags.cardSeen=true;
  if(state.flags.knifeTaken&&!state.inventory.includes('knife'))state.inventory.push('knife');
  if(state.flags.cardReturned)state.inventory=state.inventory.filter(id=>id!=='keycard');
  else if(state.flags.cardTaken&&!state.inventory.includes('keycard'))state.inventory.push('keycard');
  if(state.flags.walterAsked)note(state,'Walter sucht seine Schlüsselkarte. Ich helfe ihm.');
  if(state.flags.wcClue)note(state,'Walter hat die Karte zuletzt auf der Fensterbank im WC gesehen.');
  if(state.flags.cardSeen)note(state,'Die Schlüsselkarte steckt hinter der Heizung. Der Spalt ist zu eng für meine Hand.');
  if(state.flags.cardReturned)note(state,'Walter empfiehlt mich beim Teamleiter. Ein erster Schritt zum Büroplatz im 1. OG.');
 }
 return state;
}
function note(state,text){if(!state.journal.includes(text))state.journal.push(text);}
const line=(speaker,text)=>({speaker,text});
function dialogue(state,topic){
 const f=state.flags;
 if(topic==='intro')return [line('uncle','Hier stehen dir alle Türen offen.'),line('hero','Auch die zur Vorstandsetage?'),line('uncle','Walter erklärt dir, welche davon du bewachen sollst.')];
 if(topic==='thanks')return [line('walter','Beim Teamleiter lege ich ein gutes Wort für dich ein.'),line('hero','Welches?'),line('walter','Zuverlässig. „Unersetzlich“ würde dich hier unten festhalten.')];
 if(f.cardReturned)return [line('walter','Meine Karte ist wieder da. Und meine Empfehlung steht: Beim Teamleiter sage ich, dass auf dich Verlass ist.')];
 if(topic==='lastSeen'){
  f.wcClue=true;note(state,'Walter hat die Karte zuletzt auf der Fensterbank im WC gesehen.');
  return [line('walter','Auf der Toilette. Ich habe sie kurz auf die Fensterbank gelegt, damit sie beim Händewaschen nicht nass wird.'),line('hero','Und dann?'),line('walter','Waren wenigstens die Hände sauber.')];
 }
 if(!f.walterAsked){f.walterAsked=true;note(state,'Walter sucht seine Schlüsselkarte. Ich helfe ihm.');return [line('walter','Ich passe auf sämtliche Zugänge auf. Meine eigene Karte hat sich der Aufsicht entzogen.'),line('walter','Kannst du mir einen Gefallen tun und sie suchen? Ohne die Karte komme ich nicht einmal an meinen Ersatzschlüssel.')];}
 return [line('walter',state.inventory.includes('keycard')?'Du siehst aus, als hättest du etwas gefunden.':'Meine Taschen sind leer. Abgesehen von der Verantwortung.')];
}
function options(state){return state.flags.walterAsked&&!state.flags.cardReturned?[{id:'lastSeen',text:'Wo hast du die Karte denn zuletzt gesehen?'},{id:'continue',text:'Ich suche weiter'},{id:'bye',text:'Bis später'}]:[];}
function visible(state,id){if(state.room==='corridor'&&!state.flags.cleaningLightOn&&!['lightSwitch','lobbyExit'].includes(id))return false;if(id==='keycard')return !!state.flags.cardSeen&&!state.flags.cardTaken&&!state.flags.cardReturned;if(id==='knife')return !!state.flags.drawerOpen&&!state.flags.knifeTaken;return true;}
const descriptions={
 lightSwitch:'Ein beleuchteter Lichtschalter. Hier lässt sich wenigstens die Erleuchtung einschalten.',
 cleaningShelves:'Gegen jeden Fleck ein Mittel. Gegen die Konzernpolitik leider keines.',
 cleaningCart:'Ein Dienstwagen mit erstaunlich viel Bodenhaftung.',
 scrubber:'Die Bodenreinigungsmaschine. Sie macht mehr Fläche als der Vorstand.',
 supplyShelf:'Tücher, Eimer und Vorräte. Eine Abteilung, die tatsächlich aufräumt.',
 brochure:'Black Hole Investments & Property Management. Das Zentrum der finanziellen Schwerkraft. Sehr bescheidene Ziele.',
 brochureStand:'In der Vitrine neben der Eingangstür liegt eine Firmenbroschüre zum Mitnehmen.',
 entrance:'Durch diese Drehtür bin ich angekommen. Ich sehe mich erst einmal im Gebäude um.',
 phone:'Das Haustelefon am Empfang. Heute klingelt es erfreulich selten.',
 directory:'Büros und Besprechungsraum liegen in der 1. Etage.',
 notice:'Erdgeschoss: Empfang, WC, Reinigungsraum und Lieferhof. 1. Etage: Büros, Besprechungsraum und Officeküche. 2. Etage: Teamleiterbüro, Kopierer, EMS-Training und Pausenraum.',
 elevator:'Der Aufzug hält im Erdgeschoss, in der 1. Etage und in der 2. Etage. Am Aufzug wähle ich mein Ziel.',
 stairs:'Der beschilderte Abgang verbindet diese Etage mit der darunter. Im Erdgeschoss führt die Treppe nach oben.',
 stairsUp:'Dieser Aufgang führt von der 1. Etage in die 2. Etage.',
 wc:'Der Waschraum liegt hinter dieser Tür.',
 techDoor:'Hier geht es in den Reinigungsraum. Die Tür ist nicht abgeschlossen.',
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
 if(state.room==='corridor'&&!state.inventory.includes(target)&&!visible(state,target))return 'Im Dunkeln kann ich das nicht erkennen. Erst das Licht einschalten.';
 const f=state.flags,has=id=>state.inventory.includes(id),add=id=>{if(!has(id))state.inventory.push(id);};
 if(item==='keycard'&&target==='walter'&&['Gib','Benutze'].includes(verb)&&has('keycard')){
  state.inventory=state.inventory.filter(id=>id!=='keycard');f.cardReturned=true;f.walterAsked=true;
  note(state,'Walter empfiehlt mich beim Teamleiter. Ein erster Schritt zum Büroplatz im 1. OG.');return 'Ich gebe Walter seine Schlüsselkarte zurück. Er verspricht, mich beim Teamleiter zu empfehlen.';
 }
 if(item==='knife'&&['radiator','keycard'].includes(target)&&has('knife')){
  if(f.cardTaken||f.cardReturned)return 'Hinter der Heizung steckt keine Karte mehr.';
  if(!f.cardSeen)return 'Ich sollte mir die Heizung erst genauer anschauen.';
  f.cardTaken=true;add('keycard');return 'Mit der flachen Klinge schiebe ich die Karte aus dem Spalt. Da ist sie! Das Tafelmesser behalte ich erst einmal.';
 }
 if(item)return item==='brochure'?'Die Broschüre behalte ich zum Nachlesen.':has(item)?'Das passt hier nicht zusammen.':'Diesen Gegenstand habe ich nicht dabei.';
 if(target==='lightSwitch'&&['Benutze','Mach an','Mach aus','Drücke'].includes(verb)){f.cleaningLightOn=verb==='Mach an'?true:verb==='Mach aus'?false:!f.cleaningLightOn;return f.cleaningLightOn?'Licht an. Endlich eine übersichtliche Abteilung.':'Licht aus. Der Schalter leuchtet weiter.';}
 if(target==='walter'&&['Rede mit','Benutze'].includes(verb))return dialogue(state,'walter').map(l=>l.text).join(' ');
 if(target==='drawer'){
  if(verb==='Öffne'){f.drawerOpen=true;return f.knifeTaken?'Die Besteckschublade ist offen. Das Tafelmesser habe ich bereits.':'In der Schublade liegt ein stumpfes Tafelmesser.';}
  if(verb==='Schließe'){f.drawerOpen=false;return 'Die Schublade ist wieder geschlossen.';}
  if(verb==='Schau an')return 'Eine Besteckschublade unter der Kaffeemaschine.';
 }
 if(target==='radiator'&&verb==='Schau an'){
  if(f.cardTaken||f.cardReturned)return 'Ein Heizkörper unter dem Fenster. Die Karte steckt nicht mehr dahinter.';
  f.cardSeen=true;note(state,'Die Schlüsselkarte steckt hinter der Heizung. Der Spalt ist zu eng für meine Hand.');return 'Da blitzt etwas hinter der Heizung: Walters Schlüsselkarte! Der Spalt ist sehr eng.';
 }
 if(target==='keycard'&&verb==='Nimm')return visible(state,'keycard')?'Für meine Finger zu schmal. Für meine Karriere erstaunlich typisch.':'Hier ist keine erreichbare Karte.';
 if(target==='knife'&&verb==='Nimm'){
  if(!visible(state,'knife'))return has('knife')?'Das Messer habe ich bereits.':'Erst die Schublade öffnen.';
  f.knifeTaken=true;add('knife');return 'Ein stumpfes Tafelmesser. Flach, stabil und ohne große Schneidkraft.';
 }
 if(verb==='Schau an'&&target==='knife')return 'Ein stumpfes Tafelmesser mit flacher Klinge.';
 if(verb==='Schau an'&&target==='keycard')return has('keycard')?'Walters Schlüsselkarte. Die sollte ich ihm zurückgeben.':visible(state,'keycard')?'Die Karte steckt im schmalen Spalt hinter der Heizung.':'Hier sehe ich keine Karte.';
 if(verb==='Nimm'){
  if(target!=='brochureStand')return 'Das bleibt hier. Ich nehme nur mit, was mir gehört oder was ich für Walters Suche brauche.';
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
 if(state.room==='corridor'&&!state.flags.cleaningLightOn)return 'Benutze den leuchtenden Schalter links neben der Tür.';
 if(!state.flags.cardReturned){
  if(state.inventory.includes('keycard'))return 'Gib Walter am Empfang seine Schlüsselkarte zurück.';
  if(!state.flags.walterAsked)return 'Sprich mit Walter am Empfang. Er sucht etwas.';
  if(!state.flags.wcClue&&!state.flags.cardSeen)return 'Frag Walter noch einmal, wo er die Karte zuletzt gesehen hat.';
  if(!state.flags.cardSeen)return 'Schau dir die Heizung unter dem Fenster im WC an.';
  if(!state.inventory.includes('knife'))return 'Du brauchst etwas Flaches. In der Officeküche gibt es eine Besteckschublade.';
  return 'Benutze das Tafelmesser mit der entdeckten Karte hinter der Heizung.';
 }
 return ({lobby:'Neben dem Eingang gibt es eine Firmenbroschüre. Treppe und Aufzug verbinden die drei Etagen; rechts liegen WC, Reinigungsraum und Hof.',
 upper:'Links liegt die Officeküche. Büros und Besprechungsraum kannst du direkt betreten. Die Treppe führt nach unten ins Erdgeschoss und nach oben in die 2. Etage. Im Aufzug wählst du die Etage.',
 second:'Der Kopierraum ist offen. Büro, EMS-Training und Pausenraum liegen hinter den beschrifteten Türen. Der Treppenabgang führt in die 1. Etage.',
 teamOffice:'Durch die Tür geht es zurück in die 2. Etage. Hier gibt es gerade keine Aufgaben.',
 ems:'Die Matte ist begehbar. Durch die Tür kommst du zurück in die 2. Etage.',
 lounge:'Die Kollegen genießen ihre Pause. Die Tür führt zurück in die 2. Etage.',
 kitchen:'Sieh dich um. Durch die offene Tür kommst du zurück in die 1. Etage.'})[state.room]||'Die Tür führt zurück ins Erdgeschoss. Die Ortsleiste wählt den passenden Weg.';
}
const api={items,saveKey,legacyKey,doorFlags,fresh,restore,act,walkExit,hint,visible,options,dialogue,canEnter:()=>''};
if(typeof module!=='undefined')module.exports=api;else root.ActOne=api;
})(typeof window!=='undefined'?window:globalThis);
