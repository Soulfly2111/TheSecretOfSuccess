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
 ['stairs','Treppenhaus',52,12,10,58,1085,429,'up'],
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
 ['amenities','Pflegeartikel und Seife',31,73,40,18,490,420,'down']
 ]},
 upper:{name:'Über den Empfang hinaus.',label:'1. Etage',sub:'KONZERNZENTRALE · 1. ETAGE',width:1920,entry:'Büros links, Besprechungsraum rechts. Ganz links duftet es nach Kaffee.',objects:[
 ['kitchenDoor','Tür zur Officeküche',1,34,5.5,42,83,418,'up'],
 ['desks','Büros und Schreibtische',14,47,23,22,500,383,'up'],
 ['officeStaff','Mitarbeiterin im Büro',23.3,43,4,28,440,388,'right'],
 ['elevator','Aufzug ins Erdgeschoss',44,35,6,38,905,405,'up'],
 ['stairs','Treppe ins Erdgeschoss',55.5,15,10,58,1125,406,'up'],
 ['wcSign','WC-Wegweiser',67,39,3.5,7,1323,405,'up'],
 ['meetingTable','Besprechungsraum',76,49,17,23,1635,393,'up'],
 ['meetingStaff','Mitarbeiter im Besprechungsraum',92,42,4,28,1740,390,'right']
 ]},
 kitchen:{name:'Die wichtigste Abteilung.',label:'Officeküche',sub:'1. ETAGE · OFFICEKÜCHE',entry:'Kaffee, Tassen und ein Platz für die Pause.',objects:[
 ['upperExit','Tür zur 1. Etage',3,15,13,62,147,426,'left'],
 ['cabinets','Küchenzeile',24,15,41,20,480,378,'up'],
 ['coffeeMachine','Kaffeemaschine',28,38,5,10,295,383,'up'],
 ['sink','Spüle',40,41,9,8,432,380,'up'],
 ['fridge','Kühlschrank',66,23,11,43,690,390,'up'],
 ['seating','Sitzbereich',79,50,20,27,763,451,'right'],
 ['window','Fenster mit Stadtblick',81,14,14,35,770,435,'up']
 ]}
};
const npcs={reception:[1,381,380],walter:[0,689,425],technician:[4,651,467],driver:[5,310,475],officeStaff:[8,489,370],meetingStaff:[3,1795,374]};
rooms.delivery.objects=rooms.delivery.objects.filter(object=>['driver','intercom','lobbyExit'].includes(object[0]));
rooms.delivery.entry='Der Lieferhof. Ein ruhiger Moment zwischen zwei Lieferungen.';
const connections={
 lobby:[
  {target:'stairs',to:'upper',entry:'stairs',kind:'stairs'},
  {target:'elevator',to:'upper',entry:'elevator',kind:'elevator'},
  {target:'wc',to:'restroom',entry:'door',flag:'wcOpen'},
  {target:'techDoor',to:'corridor',entry:'door',flag:'technicalOpen'},
  {target:'sideDoor',to:'delivery',entry:'door',flag:'sideOpen'}
 ],
 upper:[
  {target:'stairs',to:'lobby',entry:'stairs',kind:'stairs'},
  {target:'elevator',to:'lobby',entry:'elevator',kind:'elevator'},
  {target:'kitchenDoor',to:'kitchen',entry:'door',flag:'kitchenOpen'}
 ],
 kitchen:[{target:'upperExit',to:'upper',entry:'kitchen',flag:'kitchenOpen'}],
 restroom:[{target:'lobbyExit',to:'lobby',entry:'wc',flag:'wcOpen'}],
 corridor:[{target:'lobbyExit',to:'lobby',entry:'tech',flag:'technicalOpen'}],
 delivery:[{target:'lobbyExit',to:'lobby',entry:'side',flag:'sideOpen'}]
};
const entries={
 lobby:{stairs:[1085,445,'down'],elevator:[806,445,'down'],wc:[1303,445,'down'],tech:[1550,451,'down'],side:[1810,478,'left']},
 upper:{stairs:[1125,421,'down'],elevator:[905,421,'down'],kitchen:[100,437,'right']},
 kitchen:{door:[147,426,'right']},restroom:{door:[145,401,'right']},corridor:{door:[125,491,'right']},delivery:{door:[865,491,'left']}
};
function cameraX(room,x){return Math.round(Math.max(0,Math.min((rooms[room].width||960)-960,x-480)));}
function install(movement){for(const [id,room] of Object.entries(rooms)){
 const geometry={width:room.width||960,floor:[[55,460],[905,460],[928,518],[45,518]],obstacles:[],spawn:[865,497],minY:450,maxY:520,minScale:2.5,maxScale:2.9,spots:{}};
 if(id==='lobby')Object.assign(geometry,{floor:[[88,424],[1760,424],[1870,463],[1870,514],[65,514],[65,459]],spawn:[180,466],minY:420,maxY:520,minScale:1.95,maxScale:2.25});
 if(id==='upper')Object.assign(geometry,{
  floor:[[45,415],[200,397],[205,340],[735,340],[735,393],[1380,393],[1380,340],[1850,340],[1870,415],[1870,514],[45,514]],
  obstacles:[[272,330,464,367],[548,330,734,367],[1490,328,1778,374]],
  spawn:[1125,421],minY:340,maxY:520,minScale:1.8,maxScale:2.25
 });
 if(id==='kitchen')Object.assign(geometry,{floor:[[65,424],[169,370],[731,370],[760,418],[915,472],[925,514],[62,514]],obstacles:[[225,0,631,350],[638,0,744,357],[749,270,959,413]],spawn:[147,426],minY:370,maxY:520,minScale:3.05,maxScale:3.5});
 if(id==='restroom')Object.assign(geometry,{floor:[[94,378],[252,350],[755,350],[874,412],[911,504],[62,504],[62,422]],obstacles:[[275,0,625,337],[654,0,748,336],[167,245,241,358],[245,447,755,540]],spawn:[145,401],minY:350,maxY:500,minScale:3.1,maxScale:3.55});
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
function connection(room,target){return connections[room]?.find(edge=>edge.target===target);}
function entry(edge){return entries[edge.to][edge.entry];}
const api={rooms,npcs,install,cameraX,connections,entries,route,connection,entry};
if(typeof module!=='undefined')module.exports=api;else root.ActOneWorld=api;
})(typeof window!=='undefined'?window:globalThis);
