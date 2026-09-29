(function(root){
'use strict';
const items={smartphone:'Smartphone',selfie:'Digitales Selfie',marble:'Marmor-Textur (Digital)',vipBadge:'VIP-Firmenausweis'};
const flags=['photoAsked','selfieTaken','marbleTaken','selfieUploaded','marbleUploaded','photoSent','printPending','badgeIssued'];
const note=(s,t)=>{if(!s.journal.includes(t))s.journal.push(t);};
function restore(s,source){for(const f of flags)s.flags[f]=source?.flags?.[f]===true;for(const id of Object.keys(items))if(id==='smartphone'||source?.inventory?.includes(id))add(s,id);for(const [id,f] of [['selfie','selfieTaken'],['marble','marbleTaken'],['vipBadge','badgeIssued']]){if(s.inventory.includes(id))s.flags[f]=true;if(s.flags[f])add(s,id);}if(s.flags.badgeIssued)s.flags.printPending=false;journal(s);}
function add(s,id){if(!s.inventory.includes(id))s.inventory.push(id);}
function journal(s){if(s.flags.photoAsked)note(s,'Firmenausweis: digitales Porträt vor dem offiziellen Black-Hole-Marmor benötigt.');if(s.flags.photoSent)note(s,'Das montierte Passfoto wurde an Ausweisdrucker_EG gesendet. Am Empfang nachfragen.');if(s.flags.badgeIssued)note(s,'VIP-Firmenausweis erhalten.');if(ready(s))note(s,'Walters Empfehlung und Firmenausweis liegen vor: Bereit für den Arbeitsbeginn.');}
function ready(s){return !!(s.flags.cardReturned&&s.flags.badgeIssued);}
function status(s){return s.flags.photoSent?'Datei gesendet an: Ausweisdrucker_EG':s.flags.selfieUploaded?'Foto 1/2 geladen. Warte auf Marmor-Hintergrund…':s.flags.marbleUploaded?'Foto 1/2 geladen. Warte auf digitales Selfie…':'MacroPhotoshop · Warte auf Selfie und Marmor-Hintergrund.';}
function act(s,v,target,item){const f=s.flags;
 if(item==='smartphone'&&v==='Benutze'){
  if(['hero','brochure','brochureStand'].includes(target)){
   if(s.room==='corridor'&&!f.cleaningLightOn)return 'Für ein Foto ist es hier zu dunkel. Ich brauche erst Licht.';
   if(target==='brochure'&&!s.inventory.includes('brochure'))return 'Die Broschüre liegt noch in der Vitrine.';
   const selfie=target==='hero',id=selfie?'selfie':'marble',flag=selfie?'selfieTaken':'marbleTaken';if(f[flag])return selfie?'Das Selfie habe ich schon. Mein Gesicht wird durch Wiederholung nicht offizieller.':'Den offiziellen Marmor habe ich bereits fotografiert.';
   f[flag]=true;add(s,id);return selfie?'Ein digitales Selfie. Gesicht: motiviert. Hintergrund: leider nicht konzernkonform.':'Die Marmor-Textur ist gespeichert. Selbst Stein hat hier ein Corporate Design.';
  }
  if(target==='graphicsPC'){
   if(f.photoSent)return status(s);
   if(!f.selfieTaken&&!f.marbleTaken)return 'Auf dem Smartphone fehlen die Bilder. Das Skript braucht ein Selfie und den offiziellen Marmor.';
   f.selfieUploaded||=!!f.selfieTaken;f.marbleUploaded||=!!f.marbleTaken;
   if(f.selfieUploaded&&f.marbleUploaded){f.photoSent=true;journal(s);return 'Perfekt! Das MacroPhotoshop-Skript schneidet mein Gesicht frei, legt den Marmor dahinter und schickt das fertige Bild direkt runter an die Rezeption!';}
   return status(s);
  }
 }
 if(v==='Schau an')return ({smartphone:'Mein Smartphone. Für Selfies, Firmenmarmor und den Upload am Grafik-PC.',selfie:'Mein digitales Selfie vor einem völlig unpassenden Hintergrund.',marble:'Offizieller Black-Hole-Marmor. Als digitale Datei sogar angenehm leicht.',vipBadge:'Black Hole Investments & Property Management · VIP. Der Ausweis enthält mein Porträt vor dem offiziellen Marmor.',graphicsPC:status(s),badgePrinter:f.badgeIssued?'Der Ausweis ist gedruckt. Mein Exemplar habe ich bereits.':'Ausweisdrucker_EG. Die Empfangsdame bedient ihn.',hero:'Bereit für ein Foto. Ob das auch für eine Karriere reicht?'})[target]??null;
 if(target==='graphicsPC'&&!item)return 'Das MacroPhotoshop-Skript wartet auf Bilder vom Smartphone.';
 if(target==='badgePrinter')return 'Die Empfangsdame kümmert sich um den Ausweisdruck.';
 return null;
}
function reception(s){
 if(s.flags.badgeIssued)return [{speaker:'reception',text:ready(s)?'Ausweis und Walters Empfehlung liegen vor. Sie sind bereit für den Arbeitsbeginn. Bitte verwechseln Sie VIP nicht mit Vorstand.':'Ihren Ausweis haben Sie. Für den Arbeitsbeginn fehlt noch Walters Empfehlung.'}];
 if(s.flags.photoSent){s.flags.printPending=true;return [{speaker:'reception',text:'Aha. Sie haben es tatsächlich geschafft, mir das Bild digital rüberzubeamen. Sogar der Marmor stimmt. Wundert mich fast, dass Sie wissen, wie man einen PC bedient.'}];}
 s.flags.photoAsked=true;journal(s);return [{speaker:'hero',text:'Ich brauche meinen Firmenausweis.'},{speaker:'reception',text:'Kein Ausweis ohne digitales Foto im System. Und zwar nicht irgendein Schnappschuss, sondern ein Portrait vor unserem offiziellen „Black Hole“-Marmorhintergrund. Schicken Sie mir die digitale Datei, sonst ziehe ich hier gar nichts durchs System. Der Nächste bitte!'}];
}
function issue(s){if(s.flags.badgeIssued||!s.flags.photoSent)return;s.flags.badgeIssued=true;s.flags.printPending=false;add(s,'vipBadge');journal(s);}
function hint(s){return s.flags.badgeIssued?'Der Firmenausweis ist erledigt.':s.flags.photoSent?'Das Foto ist gesendet. Sprich am Empfang über deinen Firmenausweis.':!s.flags.photoAsked?'Frag am Empfang nach deinem Firmenausweis.':!s.flags.selfieTaken?'Benutze dein Smartphone mit dir selbst für ein Selfie.':!s.flags.marbleTaken?'Fotografiere mit dem Smartphone die Firmenbroschüre: in der Vitrine oder im Inventar.':'Benutze dein Smartphone mit dem freien Grafik-PC in der 1. Etage.';}
const api={items,flags,restore,journal,ready,status,act,reception,issue,hint};if(typeof module!=='undefined')module.exports=api;else root.ActOnePhoto=api;
})(typeof window!=='undefined'?window:globalThis);
