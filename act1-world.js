(function(root){
'use strict';
const rooms={
 lobby:{name:'Herzlich willkommen.',label:'Erdgeschoss',sub:'KONZERNZENTRALE · ERDGESCHOSS',tile:0,width:1920,entry:'Ein langer Flur. Links der Empfang, rechts die Türen hinter den Kulissen.',objects:[
 ['entrance','Haupteingang',2,28,11,50,160,454,'up'],
 ['brochureStand','Vitrine mit Firmenbroschüre',3.5,49,4.8,27,174,465,'left'],
 ['reception','Empfang',18,35,4,19,365,439,'up'],
 ['phone','Haustelefon',27.3,50,3,6,552,435,'up'],
 ['keybook','Schlüsselbuch',24.7,53,2.3,4,490,435,'up'],
 ['badges','Besucherausweise',30.5,47,2.5,8,600,435,'up'],
 ['schedule','Terminübersicht',25.4,35,4.2,7,540,436,'up'],
 ['directory','Telefonverzeichnis',15.4,35,2.2,9,320,437,'up'],
 ['maintenance','Wartungsbuch',25.4,43,4.2,6,535,437,'up'],
 ['keyboard','Schlüsselbrett',19.5,35,5,13,430,439,'up'],
 ['walter','Walter',34,48,3.7,28,635,448,'right'],
 ['visitor','Übungsbesucher',45.6,48,4,28,845,454,'right'],
 ['elevator','Aufzug',38.5,32,7.7,38,806,432,'up'],
 ['salesman','Anzugträger',47.2,48,4,28,880,454,'right'],
 ['mara','Mara mit Modellkiste',36.8,51,4,28,670,456,'right'],
 ['uncle','Herr Direktor',47.2,48,4,28,880,454,'right'],
 ['rita','Rita',36.8,51,4,28,670,456,'right'],
 ['stairs','Treppenhaus',52,12,10,58,1085,429,'up'],
 ['wc','WC',64.5,33,7,37,1303,429,'up'],
 ['reader','Ausweisleser',75.3,47,1.6,9,1450,434,'up'],
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
 ending:{name:'Die erste Beförderung.',label:'Lastenaufzug',sub:'ETAGE 0 → −1 · FORTSETZUNG IN AKT 2',tile:5,entry:'Ich dachte, es geht hier aufwärts.',objects:[]}
};
const npcs={reception:[1,381,380],walter:[0,689,425],visitor:[2,913,427],salesman:[3,945,427],technician:[4,756,467],driver:[5,310,475],uncle:[6,945,427],rita:[7,744,442],mara:[8,744,442]};
function cameraX(room,x){return Math.round(Math.max(0,Math.min((rooms[room].width||960)-960,x-480)));}
function migrate(s){if(s.room==='lodge'||s.room==='vestibule')s.room='lobby';return s;}
function install(movement){for(const [id,room] of Object.entries(rooms)){
 movement.maps[id]={width:room.width||960,floor:[[55,460],[905,460],[928,518],[45,518]],obstacles:[],spawn:[865,497],minY:450,maxY:520,minScale:2.5,maxScale:2.9,spots:{exit:[890,493,'right']}};
 if(id==='lobby')Object.assign(movement.maps[id],{floor:[[88,424],[1760,424],[1870,463],[1870,514],[65,514],[65,459]],spawn:[180,466],minY:420,maxY:520,minScale:1.95,maxScale:2.25});
 if(id==='restroom')Object.assign(movement.maps[id],{floor:[[94,378],[252,350],[755,350],[874,412],[911,504],[62,504],[62,422]],obstacles:[[275,0,625,337],[654,0,748,336],[167,245,241,358],[245,447,755,540]],spawn:[145,401],minY:350,maxY:500,minScale:3.1,maxScale:3.55,spots:{}});
 for(const o of room.objects)movement.maps[id].spots[o[0]]=[o[6],o[7],o[8]];
 }}
function nextRoom(from,to){return from===to?to:from==='lobby'?to:'lobby';}
function exitTarget(from,to){return from==='lobby'?(to==='corridor'?'techDoor':to==='restroom'?'wc':'sideDoor'):'lobbyExit';}
function entry(room,from){if(room==='lobby')return from==='corridor'?[1550,448]:from==='restroom'?[1303,448]:[1810,467];if(room==='restroom')return [145,401];if(room==='delivery')return [865,491];if(room==='corridor')return [125,491];return null;}
const api={rooms,npcs,install,nextRoom,cameraX,migrate,exitTarget,entry};if(typeof module!=='undefined')module.exports=api;else root.ActOneWorld=api;
})(typeof window!=='undefined'?window:globalThis);
