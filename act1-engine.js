(function(root){
'use strict';
const items={invitation:'Einladung',badge:'Mitarbeiterausweis',visitorBadge:'Besucherausweis B',serviceBadge:'Technikausweis · 60 Min.',order:'Serviceauftrag',mats:'Schutzmatten',techKey:'Schlüssel K-17'};
const fresh=()=>({room:'lobby',inventory:['invitation'],flags:{},won:false,journal:[]});
function act(s,verb,target,item){
 const f=s.flags,has=id=>s.inventory.includes(id),add=id=>{if(!has(id))s.inventory.push(id)},remove=id=>s.inventory=s.inventory.filter(x=>x!==id);
 const note=(id,text)=>{f[id]=true;if(!s.journal.includes(text))s.journal.push(text);};
 if(s.won)return 'Rita: „Erst mal musst du wissen, was den Laden trägt.“ Akt 1 ist abgeschlossen.';
 if(item){
  if(!has(item))return 'Diesen Gegenstand habe ich nicht dabei.';
  if(item==='invitation'&&target==='phone')return act(s,'Wähle','callSeidelJob');
  if(item==='invitation'&&target==='walter')return 'Walter: „Personalnummer lesen, Frau Seidel anrufen. Ohne Bestätigung gibt es keinen Ausweis.“';
  if(item==='badge'&&target==='reader'){note('access','Der vorläufige Ausweis bestätigt meine Zutrittsberechtigung am Technikzugang.');return 'Piep. Zutritt genehmigt. Auf meinem Ausweis steht „Empfang und Zugangskontrolle“. Eine Schlüsselposition.';}
  if(item==='visitorBadge'&&target==='visitor'){remove(item);note('visitorDone','Besucher korrekt bei Thomas Berger / IT angemeldet. Walter ist in der Kantine.');return 'Besucher: „Danke! Thomas Berger wartet auf die Kopiererwartung.“ Walter: „Passt. Ich bin in der Kantine. Ab jetzt bist du verantwortlich. Denk an die drei Regeln!“';}
  if(item==='serviceBadge'&&target==='technician'){remove(item);note('techAdmitted','Technikerin mit zeitlich begrenztem Ausweis registriert.');return 'Technikerin: „60 Minuten reichen. Jetzt brauche ich freie Zufahrt für meinen Gerätewagen und den Schlüssel zum Technikraum.“';}
  if(item==='order'&&target==='maintenance')return act(s,'Schau an','maintenance');
  if(item==='mats'&&target==='elevator'){if(!f.destination)return 'Erst muss Frau Seidel den Bestimmungsort bestätigen.';remove(item);note('liftProtected','Der frisch polierte Aufzug ist mit Schutzmatten ausgelegt.');return 'Die Schutzmatten liegen im Aufzug. Jetzt kann der Fahrer die Büste transportieren.';}
  if(item==='techKey'&&target==='techDoor'){
   if(!f.accessClear||!f.techAdmitted)return 'Die Technikerin braucht erst ihren Ausweis und einen freien Lieferweg.';
   if(!f.keyLogged)return 'Technische Schlüssel werden nur gegen Eintrag ausgegeben.';
   remove(item);note('technicalOpen','Schlüssel K-17 dokumentiert; Technikraum gemeinsam aufgeschlossen.');return 'K-17 passt. Ich begleite die Technikerin hinein. Die Reparatur übernimmt sie.';
  }
  if(item==='badge'&&target==='techDoor')return 'Der Ausweis bestätigt meine Berechtigung. Für das mechanische Technikschloss brauche ich den richtigen Schlüssel.';
  return 'Das passt hier nicht. Vielleicht hilft ein Blick in die Unterlagen.';
 }
 if(verb==='Schau an'){
  if(target==='invitation'){note('invitationRead','Personalnummer 4711 · Ansprechpartnerin Frau Seidel, Durchwahl 100. Personaleingang hinten.');return 'EINLADUNG: „Melden Sie sich Montag zum Dienstantritt.“ Personalnummer: 4711. Ansprechpartnerin: Frau Seidel, 100. Am Empfang steht das Haustelefon. Der Personaleingang liegt hinten am Hof.';}
  if(target==='directory'){note('directoryRead','Telefon: Seidel 100 · Berger Recht 210 · Berger Vertrieb 220 · Berger IT 230 · Haustechnik 440.');return 'VERZEICHNIS: Seidel 100. Dr. Berger / Recht 210. Eva Berger / Vertrieb 220. Thomas Berger / IT 230. Haustechnik 440.';}
  if(target==='schedule'){note('scheduleRead','Terminübersicht: 09:30 Kopiererwartung · Thomas Berger · IT · Ausweis B.');return 'TERMINÜBERSICHT: 09:30, Kopiererwartung, Thomas Berger (IT), Besucherausweis B. Vorstand: heute keine Verkaufstermine.';}
  if(target==='order'){note('orderRead','Serviceauftrag: Kühlwerk GmbH · Anlage K-17 · Auftraggeber Haustechnik.');return 'SERVICEAUFTRAG: Kühlwerk GmbH, Anlage K-17, Kühlung Vorstand. Auftraggeber: Haustechnik. Dringende Störung, telefonisch beauftragt.';}
  if(target==='maintenance'){if(!f.orderRead)return 'WARTUNGSBUCH: Viele Firmen und Anlagennummern. Ich brauche den Serviceauftrag zum Abgleichen.';note('maintenanceRead','Wartungsbuch bestätigt Kühlwerk GmbH für Anlage K-17.');return 'WARTUNGSBUCH: K-17 → Kühlwerk GmbH. Firma und Anlagennummer stimmen mit dem Serviceauftrag überein. Jetzt die Haustechnik zurückrufen.';}
  if(target==='deliveryNote'){note('deliveryRead','Vollständige Bestellung: Bronzebüste → Empfang, Vorstandsetage.');return 'LIEFERSCHEIN: „Empfang, Vorstandsetage“. Aufkleber: „Kopf nach Kundenwunsch um 15 % vergrößert.“ Die Zentrale ist also gar nicht das Ziel.';}
  if(target==='notice'){note('roomMapRead','Raumzuordnung: Kühlung K-17 = alter Raum T-03. Schlüssel am Brett: K-17 / T-03.');return 'AUSHANG: „Kühlung K-17, früher T-03“. Daneben: „Tür stets geschlossen halten“ und „Tür während der Dienstzeit offen halten“. Wenigstens die Raumnummer ist eindeutig.';}
  if(target==='keyboard')return 'Drei alte Schlüssel: T-01 Archiv, T-03 Kühlung, T-08 Lager. Technische Schlüssel nur gegen Eintrag im Schlüsselbuch.';
  if(target==='keybook')return f.keyLogged?'SCHLÜSSELBUCH: Kühlwerk GmbH · K-17 / T-03 · Ausgabe durch Personalnummer 4711. Vollständig.':'Schlüsselbuch: Firma, Anlage, alte Raumnummer und ausgebende Person eintragen. „Benutze“ füllt den Eintrag aus, wenn ich die Angaben kenne.';
  if(target==='reader')return f.access?'Meine Zutrittsberechtigung ist bestätigt.':'Der Leser prüft meinen Mitarbeiterausweis. Walter am Empfang stellt ihn aus.';
  if(target==='bust')return 'Eine überlebensgroße Bronzebüste meines Onkels blockiert die gesamte Technikzufahrt. Besonders großzügig: der Kopf.';
  if(target==='phone')return 'Haustelefon. „Benutze“ öffnet das Telefonverzeichnis. Meine Notizen helfen bei Rückfragen.';
  if(target==='elevator')return f.liftProtected?'Der Aufzug ist mit Schutzmatten vorbereitet.':'Ein frisch polierter Aufzug. Für schwere Kunstwerke braucht er Schutzmatten.';
  if(target==='stairs')return 'Das Treppenhaus führt in die oberen Etagen. Mein erster Arbeitstag beginnt unten am Empfang.';
  if(target==='wc')return 'Die Mitarbeitertoilette. Im Moment gibt es dringendere Geschäfte.';
  if(target==='extinguisher')return 'Ein geprüfter Feuerlöscher. Der bleibt für echte Notfälle hier.';
  if(target==='entrance')return 'Durch diese Drehtür bin ich angekommen. Jetzt beginnt mein erster Arbeitstag.';
  if(target==='cooling')return f.repaired?'Die Kühlung läuft wieder. Die Anzeige ist grün.':'Die Kühlung steht. Die Technikerin sollte sich darum kümmern.';
  return ({fountain:'Marmor, Wasser und ein sehr teures Echo.',portrait:'Der Onkel. Sogar sein gemaltes Lächeln wirkt wie eine Dienstanweisung.',mats:'Passende Schutzmatten liegen beim Lieferfahrer.',sideDoor:'Der Nebeneingang verbindet das Erdgeschoss mit dem Lieferhof.',locker:'Ein schlecht sitzender Pförtnerblazer. Die Ärmel passen eher zu meinen Zukunftsplänen als zu meinen Armen.',badge:'Vorläufiger Mitarbeiterausweis · Nr. 4711 · Empfang und Zugangskontrolle.'})[target]||'Hier lohnt sich ein Gespräch oder ein Blick in die Unterlagen.';
 }
 if(target==='sideDoor'&&verb==='Schließe'){f.sideOpen=false;return 'Der Nebeneingang ist wieder geschlossen.';}
 if(target==='sideDoor'&&['Öffne','Drücke','Ziehe'].includes(verb)){note('sideOpen','Der Nebeneingang zum Hof ist offen.');return 'Der Nebeneingang ist offen. Dahinter liegt der Lieferhof. Mit „Gehe zu“ gehe ich hinaus.';}
 if(target==='keybook'&&verb==='Benutze'){
  if(!f.techAdmitted||!f.orderRead||!f.roomMapRead)return 'Für den Eintrag fehlen noch Angaben: registrierte Technikerin, Anlagennummer und alte Raumbezeichnung.';
  note('keyLogged','Schlüsselausgabe an Kühlwerk GmbH für K-17 / T-03 unter Personalnummer 4711 dokumentiert.');return 'Firma, Anlage K-17, alter Raum T-03 und Personalnummer 4711 eingetragen. Jetzt den passenden Schlüssel vom Brett nehmen.';
 }
 if(verb==='Nimm'){
  if(target==='badges'){
   if(!f.briefed)return 'Walter: „Erst die Übergabe. Dann stellen wir Besucherausweise aus.“';
   if(!f.visitorDone){if(!f.visitorConfirmed)return 'Zuerst den richtigen Berger ermitteln und seinen Termin bestätigen lassen.';add('visitorBadge');return 'Besucherausweis B für Thomas Berger / IT. Den gebe ich dem Übungsbesucher.';}
   if(!f.techAdmitted){if(!f.serviceConfirmed)return 'Erst den Serviceauftrag prüfen und die Haustechnik um Freigabe bitten.';add('serviceBadge');return 'Technikausweis für Kühlwerk GmbH. Gültig: 60 Minuten. Den gebe ich der Technikerin.';}
   return 'Alle erforderlichen Besucherausweise sind ausgegeben.';
  }
  if(target==='mats'){if(!f.destination)return 'Fahrer: „Erst den Zielort mit Frau Seidel klären. Dann kannst du die Matten haben.“';if(f.liftProtected)return 'Die Matten liegen bereits im Aufzug.';add('mats');return 'Passende Schutzmatten. Die lege ich im Aufzug am Haupteingang aus.';}
  if(target==='keyboard')return 'Wähle einen Schlüssel anhand von Serviceauftrag und Raumzuordnung. Vorher die Ausgabe dokumentieren.';
  if(target==='bust')return 'Das lasse ich den Lieferfahrer erledigen. Ich organisiere Zielort und Transportschutz.';
 }
 if(verb==='Wähle'){
  if(target==='callSeidelJob'){if(!f.invitationRead)return 'Seidel: „Ihre Personalnummer, bitte.“ Die steht im Einladungsschreiben. Erst genau lesen.';note('employment','Frau Seidel bestätigt Dienstantritt für Personalnummer 4711.');return 'Ich: „Personalnummer 4711.“ Seidel: „Dienstantritt bestätigt. Empfang und Zugangskontrolle. Walter stellt den vorläufigen Ausweis aus.“';}
  if(target==='handover'){if(!has('badge'))return 'Walter: „Erst deinen Mitarbeiterausweis besorgen.“';note('briefed','Walters Regeln: Ansprechpartner bestätigen, Lieferung Auftrag zuordnen, Technikzufahrt freihalten. Schlüssel nur mit Eintrag.');return 'Walter: „Drei Regeln: bestätigter Ansprechpartner, zugeordneter Lieferauftrag, freie Technikzufahrt. Und technische Schlüssel nur gegen Eintrag. Melde jetzt den Herrn dort an. Dann mache ich Pause.“';}
  if(target==='visitorReason'){note('visitorReason','Besucher kommt wegen einer Kopiererwartung.');return 'Besucher: „Wegen des Kopierers. Die dritte Wartung diesen Monat. Ich sammle bald Bonuspunkte.“';}
  if(target==='visitorDept'){note('visitorDept','Besucher wurde von der IT eingeladen, sein Ansprechpartner heißt Berger.');return 'Besucher: „IT, glaube ich. Jedenfalls der Berger, der immer sagt: Haben Sie schon neu gestartet?“';}
  if(['callBergerLaw','callBergerSales'].includes(target))return target==='callBergerLaw'?'Dr. Berger: „Wenn er wegen der Scheidung hier ist: ich. Wegen des Kopierers: anderer Berger, IT.“':'Eva Berger: „Ich verkaufe unsere Produkte, keine Tonerkartuschen. Probieren Sie Thomas Berger in der IT.“';
  if(target==='callBergerIT'){if(!f.briefed||!f.visitorReason||!f.scheduleRead)return 'Thomas Berger: „Welcher Besuch, welcher Anlass und welcher Termin? Fragen Sie den Besucher und sehen Sie in die Terminübersicht.“';note('visitorConfirmed','Thomas Berger / IT bestätigt den Besucher für die Kopiererwartung.');return 'Thomas Berger: „Ja, Kopiererwartung um 09:30. Ausweis B. Schicken Sie ihn hoch, bevor das Ding wieder Gedichte druckt.“';}
  if(target==='callSeidelSeller'){if(!f.visitorDone)return 'Seidel: „Im Moment erwarte ich nur Ihre ordnungsgemäße Einarbeitung.“';note('sellerChecked','Seidel: kein Termin für den Anzugträger. Er verkauft Luxuskaffeemaschinen.');return 'Seidel: „Kein Termin. Er möchte dem Direktor Luxuskaffeemaschinen verkaufen. Bitte auf den regulären Vertriebsweg verweisen.“';}
  if(target==='rejectSeller'){if(!f.sellerChecked)return 'Ich sollte seine Behauptung erst durch einen Rückruf bei Frau Seidel prüfen.';note('sellerRejected','Verkäufer ohne bestätigten Termin höflich abgewiesen.');return 'Ich: „Bitte vereinbaren Sie einen regulären Termin.“ Verkäufer: „Wissen Sie eigentlich, wer ich bin?“ Ich: „Das war ein wesentlicher Teil meiner Arbeit.“';}
  if(target==='callMaintenance'){if(!f.orderRead||!f.maintenanceRead)return 'Haustechnik: „Bitte erst Firma und Anlagennummer im Wartungsbuch abgleichen.“';note('serviceConfirmed','Haustechnik bestätigt Reparatur K-17 und genehmigt Zugang für Kühlwerk GmbH.');return 'Haustechnik: „Kühlwerk GmbH, K-17 – richtig. Die Kühlung im Vorstand ist ausgefallen! Zugang genehmigt. Bitte auch die Zufahrt freimachen.“';}
  if(target==='callSeidelDelivery'){if(!f.deliveryRead)return 'Seidel: „Was steht auf der vollständigen Bestellung? Lesen Sie bitte auch die zweite Zeile.“';note('destination','Seidel bestätigt Empfang Vorstandsetage. Aufzug muss mit Schutzmatten ausgelegt werden.');return 'Seidel: „Empfang der Vorstandsetage, selbstverständlich. Aber schützen Sie den frisch polierten Aufzug! Der Fahrer hat passende Matten.“';}
  if(target==='moveDelivery'){if(!f.destination||!f.liftProtected)return 'Fahrer: „Ohne bestätigten Zielort und Schutzmatten im Aufzug bewege ich die Büste nicht.“';note('accessClear','Lieferfahrer hat die Büste zur Vorstandsetage gebracht. Technikzufahrt frei.');return 'Fahrer: „Alles vorbereitet? Dann bringe ich die Büste nach oben.“ Der Gerätewagen hat endlich freie Fahrt.';}
  if(target==='keyWrong')return 'Die alte Raumnummer passt nicht zur Kühlanlage. Der Schlüssel bleibt am Brett. Vergleiche den Aushang in der Erdgeschoss.';
  if(target==='keyCorrect'){if(!f.keyLogged)return 'Walter hat es erklärt: Erst die Ausgabe ins Schlüsselbuch eintragen.';if(f.technicalOpen)return 'Der Schlüssel wurde bereits für den Technikraum ausgegeben.';add('techKey');return 'Schlüssel T-03 / K-17. Genau der dokumentierte Schlüssel für die Kühlanlage.';}
  if(target==='helpMara'){note('maraHelped','Mara die Tür aufgehalten. Sie kommt von einem Standortbesuch.');return 'Mara: „Neu hier?“ Ich: „Ist es so offensichtlich?“ Mara: „Du hilfst noch, ohne vorher zu fragen, welche Abteilung zuständig ist.“ Sie verschwindet mit ihrer Modellkiste im Aufzug.';}
  if(target==='repair'){if(!f.technicalOpen||!f.techAdmitted||!f.accessClear)return 'Die Technikerin braucht Ausweis, freie Zufahrt und den dokumentierten Technikschlüssel.';note('repaired','Kühlung fachgerecht repariert. Die Technikerin übernimmt die Arbeit.');return 'Technikerin: „Kontakt am Regler. Das haben wir gleich.“ Ein Klicken, dann ein gleichmäßiges Summen. Die Kühlung läuft – gerade rechtzeitig für den Direktor und seine Gäste.';}
  if(target==='uncleNephew'){note('uncleMet','Der Direktor nennt meinen Dienst ein unternehmensweites Nachwuchsprogramm.');return 'Onkel, vor Gästen: „Bei uns ist jeder Ablauf bis ins Detail organisiert.“ Leise: „Schon eingelebt?“ Ich: „Ich habe Ihre Büste aus dem Lieferweg räumen lassen.“ Onkel: „Eigeninitiative ist gut. Bei Kunst bitte vorher fragen. Und während der Arbeitszeit: Herr Direktor.“';}
  if(target==='audit'){if(!f.repaired||!f.sellerRejected||!f.visitorDone||!f.keyLogged||!f.accessClear)return 'Walter: „Prüfe noch einmal: Besucher, Verkäufer, Technikzufahrt, Schlüsselbuch und Kühlung. Erst dann ist die Schicht vollständig.“';note('audited','Walter bestätigt korrekte Besucherliste, freie Zufahrt und vollständiges Schlüsselbuch.');return 'Walter: „Keine Fremden im Haus, Zufahrt frei, Schlüssel dokumentiert. Du bist überqualifiziert.“ Rita sucht jemanden für die Poststelle. Walter empfiehlt mich.';}
  if(target==='acceptRita'){if(!f.audited||!f.uncleMet)return 'Rita: „Erst die Übergabe mit Walter und dem Direktor abschließen. Ich warte hier.“';note('ritaReady','Rita nimmt mich mit zur Poststelle. Treffpunkt Lastenaufzug im Technikraum.');return 'Onkel: „Ausgezeichnet. Dann lernst du unsere Kommunikationswege kennen.“ Rita: „Morgen um sieben. Zieh den Blazer aus, sonst halten dich die Briefe für ihren Vorgesetzten. Komm zum Lastenaufzug.“';}
 }
 if(verb==='Rede mit'||verb==='Benutze'){
  if(target==='phone')return 'Haustelefon: Wen rufe ich an? Das Telefonverzeichnis und mein Notizbuch liefern die passenden Angaben.';
  if(target==='intercom')return 'Haustechnik über die Sprechanlage: „Bitte melden Sie Besucher über die Pforte an. Firma und Anlage stehen auf dem Serviceauftrag.“';
  if(target==='reception'){note('receptionMet','Der Empfang verlangt einen Termin. Das Kleingedruckte der Einladung hilft weiter.');return 'Empfang: „Haben Sie einen Termin?“ Ich: „Mein Onkel erwartet mich.“ Empfang: „Das beantwortet meine Frage leider nicht.“ Ich sollte das Einladungsschreiben genau ansehen.';}
  if(target==='walter'){
   if(f.repaired)return act(s,'Wähle','audit');
   if(f.employment&&!has('badge')){add('badge');note('badgeIssued','Vorläufigen Mitarbeiterausweis von Walter erhalten.');return 'Walter stellt den Ausweis aus: „Empfang und Zugangskontrolle.“ Ich: „Mein Onkel sprach von einer Schlüsselposition.“ Walter: „Die Schlüssel hängen hinter dir.“';}
   return f.briefed?'Walter: „Bestätige den Besucher bei seinem Ansprechpartner. Verzeichnis und Terminübersicht liegen hier.“':'Walter: „Um reinzukommen, brauchst du den Ausweis, den du drinnen bekommst. Lies die Einladung und ruf Frau Seidel an. Danach machen wir die Übergabe.“';
  }
  if(target==='visitor')return 'Besucher: „Ich möchte zu Herrn Berger.“ Drei Berger stehen im Verzeichnis. Ich frage besser nach Anlass und Abteilung.';
  if(target==='salesman')return 'Anzugträger: „Der Direktor erwartet mich persönlich. Es geht um erstklassige … Geschäftsmöglichkeiten.“ Erst einmal Frau Seidel zurückrufen.';
  if(target==='technician'){if(s.room==='corridor')return act(s,'Wähle','repair');add('order');return 'Technikerin: „Kühlwerk GmbH. Die Kühlung im Vorstand steht still. Telefonischer Notfallauftrag – hier sind Firma und Anlagennummer. Meine Arbeitskleidung ersetzt natürlich keinen Besucherausweis.“';}
  if(target==='driver')return f.accessClear?'Fahrer: „Die Büste ist oben. Ein Kopf weniger hier unten.“':'Fahrer: „Auf meiner Kurzfassung steht Empfang. Die Zentrale nimmt die Büste nicht. Schau dir den vollständigen Lieferschein an. Ohne Freigabe kein Transport.“';
  if(target==='uncle')return act(s,'Wähle','uncleNephew');
  if(target==='rita')return act(s,'Wähle','acceptRita');
  if(target==='mara')return 'Eine junge Frau balanciert eine Modellkiste vom Standortbesuch. Mit vollen Händen bekommt sie die Tür nicht auf.';
  if(target==='freight'){if(!f.ritaReady)return 'Der Lastenaufzug führt zur Poststelle. Noch ist meine Schicht an der Pforte nicht beendet.';s.won=true;s.room='ending';return 'Die Etagenanzeige springt von 0 auf −1. Ich: „Ich dachte, es geht hier aufwärts.“ Rita: „Erst mal musst du wissen, was den Laden trägt.“';}
 }
 if(target==='wc')return 'Dafür ist später noch Zeit.';
 if(target==='stairs')return 'Ohne Termin geht es oben nicht weiter. Ich kümmere mich erst um meine Schicht.';
 return 'Damit komme ich noch nicht weiter. Anschauen, nachfragen oder einen passenden Gegenstand benutzen.';
}
function options(s,target){const f=s.flags;
 if(target==='phone')return [['callSeidelJob','100 · Seidel: Dienstantritt / Personalnummer 4711'],...(f.directoryRead?[['callBergerLaw','210 · Dr. Berger / Recht'],['callBergerSales','220 · Eva Berger / Vertrieb'],['callBergerIT','230 · Thomas Berger / IT']]:[]),...(f.visitorDone?[['callSeidelSeller','100 · Seidel: unangemeldeter Besucher'],['callSeidelDelivery','100 · Seidel: Zielort der Büste'],['callMaintenance','440 · Haustechnik: Serviceauftrag']]:[])];
 if(target==='walter')return f.repaired?[['audit','Schicht und Schlüsselbuch übergeben']]:!f.briefed?[['handover','Die Übergabe und Regeln erklären lassen']]:[];
 if(target==='visitor')return [['visitorReason','Nach dem Anlass fragen'],['visitorDept','Nach der Abteilung fragen']];
 if(target==='salesman')return [['rejectSeller','Auf einen regulären Termin verweisen']];
 if(target==='driver'&&!f.accessClear)return [['moveDelivery','Transport zur Vorstandsetage freigeben']];
 if(target==='keyboard')return [['keyWrong','T-01 · Archiv'],['keyCorrect','T-03 · Kühlung'],['keyWrong','T-08 · Lager']];
 if(target==='mara')return [['helpMara','Die Tür aufhalten']];
 return [];
}
function canEnter(s,room){if(room==='corridor'&&!s.flags.technicalOpen)return 'Der Technikraum ist verschlossen. Ich brauche einen dokumentierten Schlüssel und die Technikerin.';return '';}
function hint(s){const f=s.flags,has=id=>s.inventory.includes(id);
 if(!f.invitationRead)return 'Schau dir die Einladung im Inventar an. Das Kleingedruckte enthält Personalnummer und Eingang.';

 if(!f.employment)return 'Benutze das Haustelefon am Empfang und rufe Frau Seidel zum Dienstantritt an.';
 if(!has('badge'))return 'Rede nach der Bestätigung durch Seidel mit Walter. Er stellt deinen Ausweis aus.';
 if(!f.briefed)return 'Rede mit Walter und wähle die Übergabe. Merke dir seine Regeln.';
 if(!f.visitorReason)return 'Frage den Übungsbesucher nach dem Anlass seines Besuchs.';
 if(!f.scheduleRead)return 'Schau die Terminübersicht am Empfang an.';
 if(!f.directoryRead)return 'Lies das Telefonverzeichnis am Empfang.';
 if(!f.visitorConfirmed)return 'Rufe Thomas Berger in der IT an, um die Kopiererwartung zu bestätigen.';
 if(!f.visitorDone)return has('visitorBadge')?'Gib dem Übungsbesucher den Ausweis B.':'Nimm den passenden Besucherausweis vom Ausweisständer am Empfang.';
 if(!f.sellerChecked)return 'Rufe Frau Seidel wegen des Anzugträgers am Haupteingang zurück.';
 if(!f.sellerRejected)return 'Rede mit dem Anzugträger und verweise ihn auf einen regulären Termin.';
 if(!has('order'))return 'Rede im Lieferhof mit der Technikerin. Sie gibt dir ihren Serviceauftrag.';
 if(!f.orderRead)return 'Schau den Serviceauftrag im Inventar an.';
 if(!f.maintenanceRead)return 'Gleiche den Serviceauftrag mit dem Wartungsbuch am Empfang ab.';
 if(!f.serviceConfirmed)return 'Rufe über das Haustelefon die Haustechnik an.';
 if(!f.techAdmitted)return has('serviceBadge')?'Gib der Technikerin ihren zeitlich begrenzten Ausweis.':'Nimm den Technikausweis vom Ausweisständer am Empfang.';
 if(!f.deliveryRead)return 'Lies den vollständigen Lieferschein am Lieferwagen.';
 if(!f.destination)return 'Rufe Frau Seidel zum Zielort der Büste an.';
 if(!f.liftProtected)return has('mats')?'Benutze die Schutzmatten mit dem Aufzug am Haupteingang.':'Nimm die Schutzmatten beim Fahrer im Lieferhof.';
 if(!f.accessClear)return 'Rede mit dem Lieferfahrer und gib den Transport frei.';
 if(!f.access)return 'Benutze deinen Mitarbeiterausweis mit dem Leser in der Erdgeschoss.';
 if(!f.roomMapRead)return 'Lies den Aushang hinter dem Ausweisleser in der Erdgeschoss.';
 if(!f.keyLogged)return 'Benutze das Schlüsselbuch am Empfang, um die Ausgabe zu dokumentieren.';
 if(!f.technicalOpen)return has('techKey')?'Benutze Schlüssel K-17 mit der Techniktür in der Erdgeschoss.':'Nimm am Schlüsselbrett den Schlüssel für T-03 / Kühlung.';
 if(!f.repaired)return 'Gehe in den Technikraum und rede mit der Technikerin. Sie übernimmt die Reparatur.';
 if(!f.uncleMet)return 'Der Direktor ist am Haupteingang eingetroffen. Rede mit ihm.';
 if(!f.audited)return 'Walter ist zurück am Empfang. Übergib ihm die Schicht.';
 if(!f.ritaReady)return 'Rita wartet am Haupteingang. Rede mit ihr über die Poststelle.';
 return 'Benutze den Lastenaufzug im Technikraum. Rita begleitet dich nach unten.';
}
function visible(s,id){const f=s.flags;return !({visitor:!f.briefed||f.visitorDone,walter:f.visitorDone&&!f.repaired,salesman:!f.visitorDone||f.sellerRejected,technician:!f.visitorDone||s.room==='delivery'&&f.technicalOpen,driver:!f.visitorDone,bust:!f.visitorDone||f.accessClear,deliveryNote:!f.visitorDone,mats:!f.visitorDone||s.inventory.includes('mats')||f.liftProtected,uncle:!f.repaired,rita:!f.audited,mara:!f.visitorDone||f.maraHelped||f.repaired,notice:!f.access,freight:!f.repaired}[id]);}
const api={items,fresh,act,options,canEnter,hint,visible};if(typeof module!=='undefined')module.exports=api;else root.ActOne=api;
})(typeof window!=='undefined'?window:globalThis);
