(function(root){
'use strict';
const rooms={
 lobby:{name:'Herzlich willkommen.',label:'Erdgeschoss',sub:'KONZERNZENTRALE · ERDGESCHOSS',tile:0,width:1920,entry:'Ein langer Flur. Links der Empfang, rechts die Türen hinter den Kulissen.',objects:[
 ['entrance','Haupteingang',2,28,11,50,160,454,'up'],
 ['brochureStand','Vitrine mit Firmenbroschüre',3.5,49,4.8,27,174,465,'left'],
 ['reception','Empfang',18,35,4,19,365,439,'up'],
 ['phone','Haustelefon',27.3,50,3,6,552,435,'up'],
 ['directory','Telefonverzeichnis',15.4,35,2.2,9,320,437,'up'],
 ['walter','Walter',34,48,3.7,28,635,448,'right'],
 ['elevator','Aufzug',38.5,32,7.7,38,806,432,'up'],
 ['stairs','Treppe zur 1. Etage',52,12,10,58,1085,429,'up'],
 ['wc','WC',64.5,33,7,37,1303,429,'up'],
 ['notice','Raumzuordnung und Aushang',73,30,3,13,1410,433,'up'],
 ['techDoor','Tür zum Technikraum',77.5,33,7,37,1550,434,'up'],
 ['extinguisher','Feuerlöscher',85.5,34,4.5,33,1670,431,'up'],
 ['sideDoor','Nebeneingang zum Hof',92,31,6.5,47,1810,461,'up']
 ]},
 delivery:{name:'Bitte Zufahrt freihalten.',label:'Lieferhof',sub:'WARENANNAHME · TECHNIKZUFAHRT',tile:2,entry:'Eine Lieferung steht exakt auf der schraffierten Sperrfläche. Die Markierung war offenbar eine Empfehlung.',objects:[['technician','Technikerin',73,43,12,43,650,484,'right'],['driver','Lieferfahrer',25,44,12,42,260,487,'right'],['deliveryNote','Vollständiger Lieferschein',10,50,11,11,173,487,'up'],['bust','Büste auf Palette',35,18,28,66,439,490,'right'],['mats','Schutzmatten',19,65,9,8,250,490,'up'],['intercom','Gegensprechanlage',79,32,7,18,750,485,'up'],['lobbyExit','Nebeneingang ins Erdgeschoss',85,17,12,56,865,477,'up']]},
 corridor:{name:'Einen kühlen Kopf bewahren.',label:'Technikraum',sub:'ANLAGE K-17 · VORSTANDSKÜHLUNG',tile:4,entry:'Rohre statt Marmor. Hier wird dafür gesorgt, dass oben niemand ins Schwitzen kommt.',objects:[['technician','Technikerin',63,43,12,42,535,484,'right'],['cooling','Kühlanlage K-17',28,30,20,41,354,485,'up'],['freight','Lastenaufzug',83,23,14,49,847,483,'up'],['lobbyExit','Zurück ins Erdgeschoss',1,28,12,53,112,482,'left']]},
 restroom:{name:'Ein stilles Örtchen. Große Ansprüche.',label:'WC',sub:'ERDGESCHOSS · WASCHRAUM',entry:'Marmor, Messing und ein Kronleuchter. Selbst die Seife hat hier vermutlich eine Führungsposition.',objects:[
 ['lobbyExit','Tür ins Erdgeschoss',3,7,15,65,145,401,'left'],
 ['washbasin','Waschbecken',51,39,13,12,535,370,'up'],
 ['mirror','Goldgerahmter Spiegel',50,15,14,24,525,372,'up'],
 ['towels','Frische Handtücher',40,43,8,7,422,374,'up'],
 ['paperDispenser','Papierspender',28,39,7,12,301,379,'up'],
 ['wasteBin','Abfalleimer',18,46,7,17,263,392,'left'],
 ['toilet','Toilette',67,41,10,20,685,374,'up'],
 ['window','Fenster zum Hof',83,8,12,38,805,389,'up'],
 ['radiator','Heizung unter dem Fenster',84,49,13,22,808,390,'right'],
 ['keycard','Walters Schlüsselkarte',89,48,3,4,808,390,'right'],
 ['amenities','Pflegeartikel und Seife',31,73,40,18,490,420,'down']
 ]},
 upper:{name:'Über den Empfang hinaus.',label:'1. Etage',sub:'KONZERNZENTRALE · 1. ETAGE',width:1920,entry:'Büros links, Besprechungsraum rechts. Ganz links duftet es nach Kaffee.',objects:[
 ['kitchenDoor','Tür zur Officeküche',1,34,5.5,42,83,418,'up'],
 ['desks','Büros und Schreibtische',14,47,23,22,500,383,'up'],
 ['officeStaff','Mitarbeiterin im Büro',23.3,43,4,28,440,388,'right'],
 ['elevator','Aufzug · Etage wählen',44,35,6,38,905,405,'up'],
 ['stairs','Treppe ins Erdgeschoss',55.5,43,4,28,1098,406,'up'],
 ['stairsUp','Treppe zur 2. Etage',59.5,15,5.5,56,1176,406,'up'],
 ['wcSign','WC-Wegweiser',67,39,3.5,7,1323,405,'up'],
 ['meetingTable','Besprechungsraum',76,49,17,23,1635,393,'up'],
 ['meetingStaff','Mitarbeiter im Besprechungsraum',92,42,4,28,1740,390,'right']
 ]},
 kitchen:{name:'Die wichtigste Abteilung.',label:'Officeküche',sub:'1. ETAGE · OFFICEKÜCHE',entry:'Kaffee, Tassen und ein Platz für die Pause.',objects:[
 ['upperExit','Tür zur 1. Etage',3,15,13,62,147,426,'left'],
 ['cabinets','Küchenzeile',24,15,41,20,480,378,'up'],
 ['coffeeMachine','Kaffeemaschine',28,38,5,10,295,383,'up'],
 ['drawer','Besteckschublade',23,49,8,9,337,383,'left'],
 ['knife','Tafelmesser',25,49,4,3,337,383,'left'],
 ['sink','Spüle',40,41,9,8,432,380,'up'],
 ['fridge','Kühlschrank',66,23,11,43,690,390,'up'],
 ['seating','Sitzbereich',79,50,20,27,763,451,'right'],
 ['window','Fenster mit Stadtblick',81,14,14,35,770,435,'up']
 ]}
};
Object.assign(rooms,{
 second:{name:'Zwischen Kopien und Kaffeepause.',label:'2. Etage',sub:'KONZERNZENTRALE · 2. ETAGE',width:1920,entry:'Links Büro und Kopierraum. Rechts Training und Pause. Dazwischen der Weg nach unten.',objects:[
 ['officeDoor','Tür zum Teamleiterbüro',1,34,5.5,40,80,420,'up'],
 ['copier','Kopierer',19,39,6.5,24,438,364,'up'],
 ['fax','Faxgerät',14.5,46,5,11,325,376,'up'],
 ['paperShelf','Papierregal',26,31,9,32,590,352,'up'],
 ['waterDispenser','Wasserspender',10,47,3.5,24,263,395,'left'],
 ['copyStaff','Mitarbeiterin am Kopierer',32.4,43,4,28,598,387,'right'],
 ['elevator','Aufzug · Etage wählen',44,35,6,38,905,405,'up'],
 ['stairs','Treppe zur 1. Etage',60,60,8,13,1228,408,'up'],
 ['floorGuide','Etagenübersicht',68,35,2.5,16,1320,418,'up'],
 ['emsDoor','Tür zum EMS-Trainingsraum',76.5,35,6.5,38,1534,407,'up'],
 ['loungeDoor','Tür zum Pausenraum',89.5,35,6.5,38,1775,407,'up']
 ]},
 teamOffice:{name:'Ein Büro für große Entscheidungen.',label:'Teamleiterbüro',sub:'2. ETAGE · TEAMLEITERBÜRO',entry:'Ein Schreibtisch, viele Akten und ein Blick über die Stadt.',objects:[
 ['secondExit','Tür zur 2. Etage',3,8,13,63,143,405,'left'],
 ['teamDesk','Schreibtisch des Teamleiters',39,40,31,20,570,367,'up'],
 ['teamComputer','Computer',57,31,7,11,646,354,'up'],
 ['teamFiles','Aktenschrank',31,24,12,29,331,322,'up'],
 ['visitorChair','Besucherstuhl',38,43,13,20,415,376,'up'],
 ['teamLeader','Teamleiter',71,23,10,43,715,382,'up'],
 ['window','Fenster mit Stadtblick',79,8,16,31,769,373,'up']
 ]},
 ems:{name:'Karriere braucht Ausdauer.',label:'EMS-Training',sub:'2. ETAGE · EMS-TRAININGSRAUM',entry:'Trainingsgeräte, eine Matte und eine überraschend ruhige Pause vom Büro.',objects:[
 ['secondExit','Tür zur 2. Etage',2,9,11,56,132,389,'left'],
 ['emsConsole','EMS-Trainingsgerät',24,30,10,24,277,318,'up'],
 ['trainingVest','Trainingsweste',35,30,12,22,401,319,'up'],
 ['trainingMat','Trainingsmatte',39,54,27,5,503,330,'up'],
 ['locker','Spind',63,22,9,31,661,312,'up'],
 ['trainer','Trainer',67,27,9,39,665,367,'right'],
 ['weights','Hanteln',78,40,11,19,789,357,'up'],
 ['towels','Handtücher',56,36,7,4,548,313,'up']
 ]},
 lounge:{name:'Erfolg macht auch mal Pause.',label:'Pausenraum',sub:'2. ETAGE · PAUSENRAUM',entry:'Rote und grüne Sofas. Hier darf sogar die Karriere kurz sitzen bleiben.',objects:[
 ['secondExit','Tür zur 2. Etage',2,12,11,56,127,398,'left'],
 ['fridge','Kühlschrank',21,28,5,26,209,321,'up'],
 ['coffeeMachine','Kaffeemaschine',28,31,4,10,296,315,'up'],
 ['redSofa','Rotes Sofa',36,40,28,15,376,331,'up'],
 ['greenSofa','Grünes Sofa',73,41,20,21,739,373,'up'],
 ['coffeeTable','Couchtisch',43,51,19,10,529,357,'up'],
 ['beanbag','Sitzsack',65,43,7,13,652,336,'up'],
 ['guitar','Gitarre',91,39,6,24,867,379,'up'],
 ['breakStaff','Mitarbeiterin in der Pause',64,27,10,40,639,389,'right']
 ]}
});
const npcs={reception:[1,381,380],walter:[0,689,425],technician:[4,651,467],driver:[5,310,475],officeStaff:[8,489,370],meetingStaff:[3,1795,374],copyStaff:[1,656,378,'second'],teamLeader:[0,724,344,'second'],trainer:[2,710,351,'second'],breakStaff:[3,695,358,'second']};
rooms.delivery.objects=rooms.delivery.objects.filter(object=>['driver','intercom','lobbyExit'].includes(object[0]));
rooms.delivery.entry='Der Lieferhof. Ein ruhiger Moment zwischen zwei Lieferungen.';
const connections={
 lobby:[
  {target:'stairs',to:'upper',entry:'stairs',kind:'stairs'},
  {target:'elevator',to:'upper',entry:'elevator',kind:'elevator'},
  {target:'elevator',to:'second',entry:'elevator',kind:'elevator'},
  {target:'wc',to:'restroom',entry:'door',flag:'wcOpen'},
  {target:'techDoor',to:'corridor',entry:'door',flag:'technicalOpen'},
  {target:'sideDoor',to:'delivery',entry:'door',flag:'sideOpen'}
 ],
 upper:[
  {target:'stairs',to:'lobby',entry:'stairs',kind:'stairs'},
  {target:'stairsUp',to:'second',entry:'stairs',kind:'stairs'},
  {target:'elevator',to:'lobby',entry:'elevator',kind:'elevator'},
  {target:'elevator',to:'second',entry:'elevator',kind:'elevator'},
  {target:'kitchenDoor',to:'kitchen',entry:'door',flag:'kitchenOpen'}
 ],
 second:[
  {target:'stairs',to:'upper',entry:'stairsUp',kind:'stairs'},
  {target:'elevator',to:'lobby',entry:'elevator',kind:'elevator'},
  {target:'elevator',to:'upper',entry:'elevator',kind:'elevator'},
  {target:'officeDoor',to:'teamOffice',entry:'door',flag:'officeOpen'},
  {target:'emsDoor',to:'ems',entry:'door',flag:'emsOpen'},
  {target:'loungeDoor',to:'lounge',entry:'door',flag:'loungeOpen'}
 ],
 teamOffice:[{target:'secondExit',to:'second',entry:'office',flag:'officeOpen'}],
 ems:[{target:'secondExit',to:'second',entry:'ems',flag:'emsOpen'}],
 lounge:[{target:'secondExit',to:'second',entry:'lounge',flag:'loungeOpen'}],
 kitchen:[{target:'upperExit',to:'upper',entry:'kitchen',flag:'kitchenOpen'}],
 restroom:[{target:'lobbyExit',to:'lobby',entry:'wc',flag:'wcOpen'}],
 corridor:[{target:'lobbyExit',to:'lobby',entry:'tech',flag:'technicalOpen'}],
 delivery:[{target:'lobbyExit',to:'lobby',entry:'side',flag:'sideOpen'}]
};
const entries={
 lobby:{stairs:[1085,445,'down'],elevator:[806,445,'down'],wc:[1303,445,'down'],tech:[1550,451,'down'],side:[1810,478,'left']},
 upper:{stairs:[1098,421,'down'],stairsUp:[1176,421,'down'],elevator:[905,421,'down'],kitchen:[100,437,'right']},
 second:{stairs:[1228,428,'down'],elevator:[905,421,'down'],office:[100,437,'right'],ems:[1534,424,'down'],lounge:[1775,424,'down']},
 teamOffice:{door:[143,405,'right']},ems:{door:[132,389,'right']},lounge:{door:[127,398,'right']},
 kitchen:{door:[147,426,'right']},restroom:{door:[145,401,'right']},corridor:{door:[125,491,'right']},delivery:{door:[865,491,'left']}
};
function cameraX(room,x){return Math.round(Math.max(0,Math.min((rooms[room].width||960)-960,x-480)));}
function install(movement){for(const [id,room] of Object.entries(rooms)){
 const geometry={width:room.width||960,floor:[[55,460],[905,460],[928,518],[45,518]],obstacles:[],spawn:[865,497],minY:450,maxY:520,minScale:2.5,maxScale:2.9,spots:{}};
 if(id==='lobby')Object.assign(geometry,{floor:[[88,424],[1760,424],[1870,463],[1870,514],[65,514],[65,459]],spawn:[180,466],minY:420,maxY:520,minScale:1.95,maxScale:2.25});
 if(id==='upper')Object.assign(geometry,{
  floor:[[45,415],[200,397],[205,340],[735,340],[735,393],[1380,393],[1380,340],[1850,340],[1870,415],[1870,514],[45,514]],
  obstacles:[[272,330,464,367],[548,330,734,367],[1490,328,1778,374]],
  spawn:[1098,421],minY:340,maxY:520,minScale:1.8,maxScale:2.25
 });
 if(id==='second')Object.assign(geometry,{
  floor:[[45,415],[263,393],[263,346],[740,346],[740,393],[1870,393],[1870,514],[45,514]],
  obstacles:[[194,0,244,384],[272,0,490,339],[492,0,732,329],[1058,0,1150,395],[1295,0,1398,395]],
  spawn:[1228,428],minY:340,maxY:520,minScale:1.8,maxScale:2.25
 });
 if(id==='teamOffice')Object.assign(geometry,{
  floor:[[65,401],[190,344],[300,300],[718,300],[889,377],[920,508],[55,508]],
  obstacles:[[300,0,365,285],[374,0,676,332],[374,230,485,348],[808,0,960,375],[230,0,290,294]],
  spawn:[143,405],minY:300,maxY:510,minScale:2.8,maxScale:3.45
 });
 if(id==='ems')Object.assign(geometry,{
  floor:[[65,371],[170,330],[265,300],[825,300],[900,374],[920,510],[55,510]],
  obstacles:[[237,0,465,288],[603,0,745,288],[748,0,855,328],[860,0,960,370]],
  spawn:[132,389],minY:300,maxY:510,minScale:2.8,maxScale:3.45
 });
 if(id==='lounge')Object.assign(geometry,{
  floor:[[65,380],[184,319],[230,300],[718,300],[899,385],[925,510],[55,510]],
  obstacles:[[202,0,342,296],[355,0,620,300],[413,274,602,327],[632,0,697,297],[698,0,910,348],[128,0,179,334]],
  spawn:[127,398],minY:300,maxY:510,minScale:2.8,maxScale:3.45
 });
 if(id==='kitchen')Object.assign(geometry,{floor:[[65,424],[169,370],[731,370],[760,418],[915,472],[925,514],[62,514]],obstacles:[[225,0,631,350],[638,0,744,357],[749,270,959,413]],spawn:[147,426],minY:370,maxY:520,minScale:3.05,maxScale:3.5});
 if(id==='restroom')Object.assign(geometry,{floor:[[94,378],[252,350],[755,350],[874,412],[911,504],[62,504],[62,422]],obstacles:[[275,0,625,337],[654,0,748,336],[167,245,241,358],[245,447,755,540],[845,0,940,389]],spawn:[145,401],minY:350,maxY:500,minScale:3.1,maxScale:3.55});
 for(const object of room.objects)geometry.spots[object[0]]=[object[6],object[7],object[8]];
 room.connections=connections[id];room.entries=entries[id];room.geometry=geometry;room.camera=[0,(room.width||960)-960];movement.maps[id]=geometry;
}}
function route(from,to){
 if(from===to)return [];
 const queue=[{room:from,path:[]}],visited=new Set([from]);
 while(queue.length){
  const current=queue.shift();
  for(const edge of connections[current.room]||[]){
   if(visited.has(edge.to))continue;
   const path=[...current.path,edge];
   if(edge.to===to)return path;
   visited.add(edge.to);queue.push({room:edge.to,path});
  }
 }
 return [];
}
const floors=['lobby','upper','second'];
function liftOptions(room){return floors.map(id=>({id,label:rooms[id].label,current:id===room}));}
function connection(room,target,destination){return connections[room]?.find(edge=>edge.target===target&&(!destination||edge.to===destination));}
function entry(edge){return entries[edge.to][edge.entry];}
const api={rooms,npcs,install,cameraX,connections,entries,route,connection,entry,floors,liftOptions};
if(typeof module!=='undefined')module.exports=api;else root.ActOneWorld=api;
})(typeof window!=='undefined'?window:globalThis);
