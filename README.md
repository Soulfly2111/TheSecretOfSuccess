# The Secret of My Success – Prolog und Akt 1

Eine separate, spielbare TypeScript-/Phaser-/Vite-Migration befindet sich in [migration](migration/README.md). Die bisherige Version bleibt die Referenz; die Vorschau verwendet eigene Spielstände.

## Kapitelwahl

Beim Start steht die Auswahl zwischen Prolog und Akt 1 zur Verfügung. Beide Kapitel sind frei spielbar. Über „Kapitel“ kann jederzeit gewechselt werden. Bestehende Prolog-Spielstände bleiben unter `success-prolog-v1` erhalten; Akt 1 verwendet `success-act1-exploration-v1`. Nach dem Prolog führt ein Link direkt zu Akt 1. `act1.html` öffnet das neue Kapitel direkt.

## Akt 1: Herzlich willkommen. Personaleingang hinten.

Zehn verbundene Räume: Erdgeschoss, 1. Etage, Officeküche, Lieferhof, Reinigungsraum, WC, 2. Etage, Teamleiterbüro, EMS-Training und Pausenraum. Die drei Etagen sind seitlich scrollende Panoramen (1920 × 540 Weltpunkte; Sichtfenster 960 × 540). Die 1. Etage enthält links die Küchentür, offene Büros, Aufzug und Treppenhaus sowie rechts den begehbaren Besprechungsraum. Das WC-Schild oben verweist auf das WC im Erdgeschoss.

Akt 1 beginnt mit einer animierten Begrüßung durch den Onkel. Er verweist den Protagonisten an Walter und geht zum Aufzug. Das erste Rätsel ist Walters verlorene Schlüsselkarte: Walter um Hilfe bitten hören, bei erneutem Gespräch nach dem letzten Fundort fragen, die Heizung unter dem WC-Fenster untersuchen, in der Officeküche die Besteckschublade öffnen und das Tafelmesser nehmen, damit die Karte bergen und Walter zurückgeben. Die Karte bleibt vor der Untersuchung vollständig verborgen. Messer und Karte dürfen auch vor Walters Bitte gefunden werden. Die Rückgabe bringt Walters Empfehlung beim Teamleiter; weitere Rätsel und der Büroplatz als Kapitelabschluss folgen später. Alle Räume bleiben erreichbar und die Firmenbroschüre bleibt lesbar.

Onkel und Walter haben vier Blickrichtungen sowie Lauf-, Blink-, Sprech- und Ruhephasen. Walter läuft nervös auf und ab und prüft seine Taschen; nach der Rückgabe steht er ruhig. Alle Spieltexte erscheinen innerhalb der Szene als blaue, dunkel umrandete Pixelschrift. Klick auf den Text, „Weiter“ oder Enter schaltet Gespräche weiter. Antworten stehen untereinander, werden bei Mausberührung oder Tastaturfokus hervorgehoben und lassen sich anklicken oder antippen. Gewählte Antworten spricht zunächst der Protagonist. Lange Texte werden auf Seiten verteilt; einfache Kommentare verschwinden beim Beginn einer neuen Aktion. Prolog und Akt 1 verwenden dieselbe Anzeige auf Desktop und Mobilgeräten. Der Onkel nutzt einen streckenabhängigen Laufzyklus mit neutralen Zwischenphasen und stabilisierten Körperankern. Grafikdateien und vollständige Prompts: `assets/ACT1-WALTER-ART.md`.

Der bestehende Erkundungsspielstand wird als Version 3 erweitert: Begrüßung, Bitte, WC-Hinweis, Kartenentdeckung, Schubladenöffnung, Aufnahme und Rückgabe sind persistent. Ältere Erkundungsspielstände behalten ihren Raum, ihre Türen und die Broschüre; die Begrüßung beginnt bei der nächsten freien Rückkehr ins Erdgeschoss. Unterbrochene Begrüßungen starten erneut, abgeschlossene nicht. Legacy-Rätselstände und Prolog-Speicher bleiben getrennt.

Zusätzliche Prüfungen: `node test-walter.cjs` für Rätsellogik und Migration, `node test-walter-browser.cjs` für vollständige Desktop- und Touch-Abläufe samt Animationen, Dialogen, Objektzuständen und Neuladen. Die Browserprüfung verwendet isolierte Kontexte und dieselben `QA_URL`/`QA_OUTPUT`-Variablen wie die übrigen Browsertests.

Die 2. Etage zeigt von links nach rechts die Teamleiterbürotür, den offen begehbaren Kopier- und Faxraum, Aufzug und Treppenabgang, EMS-Tür und Pausenraumtür. Büro, EMS-Training und Pausenraum haben eigene Innenansichten, Möbelhindernisse und separate Mitarbeiter-Sprites.

Treppen verbinden benachbarte Etagen; der Aufzug bietet alle drei Etagen. Raumwechsel erfolgen nach dem Hinlaufen über die Objekte der Spielwelt. Bodenklicks am Rand führen weiter durch Panoramen, die Kamera folgt. Möbel sperren ihre Standflächen und verdecken Figuren entsprechend ihrer Tiefe.

Der neue Speicherstand übernimmt Broschüre und gültigen Raum aus `success-act1-v1`, solange noch kein neuer Erkundungsspielstand existiert. Frühere Abschlussstände starten im Erdgeschoss. Der alte Spielstand wird weder überschrieben noch gelöscht. Neustart betrifft ausschließlich den neuen Speicherstand. Neue Raum- und Türzustände werden unter demselben Erkundungsschlüssel gespeichert. Vorhandene Spielstände sind weiterhin kompatibel. Der Prolog ist unverändert.

`node test-act1.cjs` prüft freie Interaktionen, Broschüre, Save-Migration, sämtliche Raumverbindungen und Laufziele, Kameragrenzen und Möbelhindernisse. Die vier Prolog-Testdateien prüfen die unveränderte Prologlogik. `node test-browser.cjs` prüft im laufenden lokalen Server alle Etagen, Aufzugziele und Abbruch, Türen, Gespräche, Spielstandübernahme und Neuladen in den neuen Räumen. Es benötigt das Node-Paket `playwright` und installiertes Chrome unter Windows. `QA_URL` überschreibt die Basis-URL, `QA_OUTPUT` das Verzeichnis für Screenshots. Browser-Kontexte sind isoliert; Benutzer-Spielstände werden nicht verändert.

Bilddateien und vollständige Imagegen-Prompts zur 2. Etage: `assets/ACT1-SECOND-FLOOR-ART.md`.

Ein eigenständiger deutscher Point-and-Click-Prototyp mit vier Schauplätzen: Hof, Garage, Scheune und ländliches Haus. Start mit `python -m http.server 8765 --bind 127.0.0.1` in diesem Ordner, dann `http://127.0.0.1:8765/` öffnen. Der lokale Server ist für das Auslesen der transparenten Spritebögen erforderlich; direktes Öffnen über `file://` wird nicht unterstützt.

## Mobile Steuerung

Touch und Maus verwenden dieselbe Oberfläche: drei Symbolbuttons rechts für Menü, Inventar und gehaltene Hotspot-Anzeige. Objekte öffnen ein Rad mit zustandsabhängigen Aktionen; auch offene Türen werden über „Gehe zu“ im Rad betreten. Kopf-, Verb- und Ortsleisten sowie Laufpfeile entfallen. Gegenstände werden über das separate Inventar ausgewählt und direkt auf Ziele angewandt. Die alte Ansichtspräferenz wird ignoriert, Spielstände bleiben erhalten.

`mobile.js` und `mobile.css` stellen die gemeinsame Oberfläche bereit. `context-actions.js` liefert die zustandsabhängigen Verben ohne zweite Rätsellogik. Adapter liefern Inventarsymbole, Hinweise und Objektausführung. Szene und Aktionen pausieren hinter Overlays.

`node test-mobile.cjs` prüft mit Playwright/Chrome-Touchemulation den vollständigen Prolog, Kombinationen, überlappende Ziele, verzögerte Interaktionen, Bildschirmdrehung, Dialogseiten, Ansichtswechsel und Speichern sowie Türen, Treppen, Aufzugziele und Broschüre in Akt 1. Ansichtsgrößen: 667×375, 844×390, 932×430 und 1180×820. `QA_URL` und `QA_OUTPUT` funktionieren wie im Desktop-Test. Dies sind Browseremulationen, keine Prüfungen auf physischen Mobilgeräten.

## Klassische Steuerung

Bedienung: Boden antippen zum Laufen, Objekt kurz antippen zum Anschauen; Rechtsklick oder 500 ms Halten öffnet das Aktionsrad. Lupe oder Leertaste halten für Hotspots. Tab/Enter bedienen Standardaktionen und Buttons; Umschalt+F10 öffnet das Rad, Escape schließt das oberste Overlay. Spielstände bleiben lokal im Browser.

## Lösung

1. Haus: Handbuch anschauen; Autoschlüssel nehmen.
2. Küche: Leere Tasse nehmen, Küchenschrank öffnen und Kaffeepulver nehmen. Tasse mit dem Brunnen vorne auf dem Hof benutzen. In der Küche Wasser und Kaffeepulver mit der Kaffeekanne benutzen. Herd mit „Mach an“ einschalten. Leere Tasse mit Kanne benutzen und Kaffee Kalle geben.
3. Garage: Werkzeugkasten öffnen und nehmen (Schraubenschlüssel); Putzlappen nehmen.
4. Scheune: Schraubenschlüssel mit Traktor benutzen.
5. Im Inventar Putzlappen mit öligem Keilriemen kombinieren.
6. Hof: Auto öffnen. Schraubenschlüssel mit Auto benutzen, dann Keilriemen mit Auto benutzen.
7. Autoschlüssel mit Auto benutzen.

Optional: Heu und Truhe untersuchen. Kaffee für Kalle ist Voraussetzung für das Werkzeug. Alte Spielstände bleiben erhalten; für die neue Kaffeekette einen neuen Prolog beginnen.

## Umfang

Komplette Prolog-Rätselkette mit Abschlussdialog, Kontextaktionen, Inventar, kontextabhängigen Hinweisen und Speicherstand. Akt 2 und spätere Akte sind noch nicht implementiert. Version 2 verwendet gröbere Pixelhintergründe und einen transparenten Spritebogen mit vier Blickrichtungen und vier Laufphasen pro Richtung. Kalle besitzt Ruhe-, Blinzel- und Gesprächsanimationen. Die Figur wird je nach Raum und Tiefe perspektivisch skaliert. Laufwege nutzen ein Raster mit begehbaren Bodenflächen und Hindernissen; Aktionen werden bei Ankunft einmalig ausgelöst. Rendering auf einem gemeinsamen 480×270-Pixelraster mit ungeglätteter Skalierung. Die Schrift lädt optional von Google Fonts; lokale Ersatzschriften funktionieren offline.

Prüfung der Rätsellogik: `node test-engine.cjs`. Laufwege, Hindernisse, perspektivische Skalierung und verzögerte Aktionen: `node test-movement.cjs`. Sichtbare Objektzustände: `node test-scene-state.cjs`. Der URL-Parameter `?test` startet einen unabhängigen Testspielstand ohne Schreiben in den gespeicherten Nutzerfortschritt.

Version 3 zeigt feinere Pixelgrafik auf einem 640×360-Raster. Handbuch, Autoschlüssel, Kaffeetasse, Putzlappen und Traktorriemen verschwinden aus der Szene, sobald sie mitgenommen werden. Motorhaube, Werkzeugkasten und Truhe haben sichtbare offene und geschlossene Zustände. Der Schraubenschlüssel liegt nur bis zur Entnahme im offenen Kasten. Bildzustände werden aus demselben gespeicherten Spielstand abgeleitet wie die Rätsel. Die Küche verwendet zusätzliche Kollisionsflächen und einen Abstand vor den Möbeln.

Version 4 dreht das Auto in eine Front-Dreiviertelansicht: Front und Motorraum zeigen zum Spieler, das Heck nach hinten rechts. Geschlossene und geöffnete Motorhaube verwenden deckungsgleiche Fahrzeugansichten. Der Interaktionspunkt liegt vor der linken Fahrzeugecke; Laufhindernis und anklickbarer Bereich sind entsprechend angepasst.

Aktuelle Grafikdateien: `assets/locations-v3.png`, `assets/locations-states-v3.png`, `assets/car-front-closed-v4.png`, `assets/car-front-open-v4.png`, `assets/hero-walk.png`, `assets/mechanic-idle.png`. Herkunft und Prompts stehen in `assets/ART-DIRECTION.md`.

`node test-dialogue-browser.cjs` prüft die gemeinsame Dialoganzeige, Sprecher, Hover, Tastatur, Touch, Seitenwechsel, fehlende Klickweitergabe und die Position innerhalb der Szene. Die Bewegungstests prüfen zusätzlich gleichmäßige Bewegung über kurze Wegsegmente bei verschiedenen Bildraten.

## Figurenfarben und Onkel-Sprechanimation

`Speakers` ordnet stabile Figurenkennungen den Dialogfarben zu. Protagonist: blau; Onkel: rot; Walter: gelb. Auch gleich benannte Mitarbeiter haben eigene Farben. Empfang und Gegensprechanlage teilen eine Identität. Antwortoptionen bleiben blau mit heller Fokus-/Hover-Markierung.

Der Onkel besitzt einen separaten transparenten Sprechbogen mit zwölf Bildern je Richtung (48 insgesamt). Die JSON-Metadaten enthalten Zuschnitte und feste Fußanker. Zwei unterschiedlich aufgebaute Sprechfolgen verwenden 90–180 ms Haltezeiten, Mundformen und kleine Gesten. Die Zeitleiste pausiert bei Spielpause und ausgeblendetem Browser-Tab. Es gibt keine lautgenaue Lippensynchronisation. `node test-speakers-browser.cjs` prüft Farben, Identitäten, zwölf Sprechphasen, Pause, Sprecherwechsel und Abgang auf Desktop und Touch.

Die Sprechbilder verwenden je Blickrichtung die Skalierung des neutralen Referenzbildes. Unterschiedliche Zuschnitthöhen skalieren die Figur nicht mehr um; Fußanker werden exakt auf dieselbe Position abgebildet. `node test-uncle-scale.cjs` prüft alle 48 Bilder auf konstante Skalierung und Ankerposition sowie den Größenübergang zur neutralen Laufpose und erstellt eine Vergleichsansicht.

## Reinigungsraum

Der frühere Technikraum ist ein Reinigungsraum mit mittiger Tür. Beim ersten Eintritt ist er fast dunkel; nur Schalter und Ausgang bleiben bedienbar. Benutze/Mach an/Mach aus steuern das gespeicherte Licht. Im Dunkeln bleiben Möbel-Hotspots verborgen. Die interne Raumkennung corridor bleibt für Spielstände erhalten.

Prüfung: test-cleaning.cjs und test-cleaning-browser.cjs (Desktop und emuliertes Touch-Gerät; kein physisches Mobilgerät). Bild und Prompt: assets/ACT1-CLEANING-ART.md.

## Digitales Marmor-Passfoto

Parallel zu Walter: Smartphone auf Protagonist und Broschüre verwenden, Bilder am freien Grafik-PC der 1. Etage übertragen und VIP-Ausweis am Empfang abholen. Der zweite Upload montiert und sendet automatisch. Beide Aufgaben zusammen markieren die Bereitschaft zum Arbeitsbeginn. Smartphone und Fotos sind reine Spielgegenstände; kein Kamerazugriff oder externer Upload. Bestehende Spielstände bekommen das Smartphone automatisch.

Logik: act1-photo.js. Prüfungen: test-photo.cjs, test-photo-browser.cjs. Protagonisten-Hotspot erscheint nur bei ausgewähltem Smartphone; mobile Auswahl meldet diesen Zustand über eine optionale Adapterfunktion. Ausweis, Selfie, PC und Drucker nutzen die vorhandene Canvas-Pixelgrafik und Heldensprites.


## Aktuelle Oberfläche prüfen

`test-radial-prolog.cjs`: kompletter Prolog per Touch. `test-radial-act1.cjs`: Walter und Passfoto per Touch und Maus, Türen, Aufzüge, Etagen, Reinigungsraum und Speichern. `test-radial-ui.cjs`: Bildschirmgrößen, Ränder, Halten/Loslassen, Tastatur und Inventarüberlauf. `test-radial-pause.cjs`: Menüpause, Hilfe und Kapitelwahl während Dialogen. Gemeinsame Browserhelfer: `qa-radial.cjs`. Ältere GUI-Tests beziehen sich auf die abgelösten Leisten und werden durch diese Prüfungen ersetzt. Reine Logiktests bleiben gültig. Die Touchprüfung ist Browseremulation, kein physisches Mobilgerät.

## Direkte Maus- und Touchsteuerung (1. Oktober 2026)
Linksklick/kurzes Tippen untersucht Objekte nach dem Hinlaufen; offene Durchgänge werden direkt betreten. Rechtsklick oder 500 ms Halten öffnet das Aktionsrad. Mauszeiger über Objekten zeigt deren Namen. Beschreibungen bieten zusätzlich „Aktionen“. Neuer Bodenklick ersetzt einen laufenden Auftrag. Umschalt+F10 öffnet das Rad per Tastatur, Enter führt die Standardaktion aus. Die einmalige Touchhilfe wird getrennt vom Spielstand gespeichert.
Prüfung: `test-direct-input.cjs` deckt Standardaktionen, Mouseover, Halten, Gestenabbruch und Laufzielwechsel ab. Die aktualisierten `test-radial-*` verwenden Rechtsklick bzw. echte Touchereignisse in Chrome-Emulation. Keine Prüfung auf einem physischen Mobilgerät.
