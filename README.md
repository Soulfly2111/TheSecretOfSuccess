# The Secret of My Success – Prolog und Akt 1

## Kapitelwahl

Beim Start steht die Auswahl zwischen Prolog und Akt 1 zur Verfügung. Beide Kapitel sind frei spielbar. Über „Kapitel“ kann jederzeit gewechselt werden. Bestehende Prolog-Spielstände bleiben unter `success-prolog-v1` erhalten; Akt 1 verwendet `success-act1-exploration-v1`. Nach dem Prolog führt ein Link direkt zu Akt 1. `act1.html` öffnet das neue Kapitel direkt.

## Akt 1: Herzlich willkommen. Personaleingang hinten.

Zehn verbundene Räume: Erdgeschoss, 1. Etage, Officeküche, Lieferhof, Technikraum, WC, 2. Etage, Teamleiterbüro, EMS-Training und Pausenraum. Die drei Etagen sind seitlich scrollende Panoramen (1920 × 540 Weltpunkte; Sichtfenster 960 × 540). Die 1. Etage enthält links die Küchentür, offene Büros, Aufzug und Treppenhaus sowie rechts den begehbaren Besprechungsraum. Das WC-Schild oben verweist auf das WC im Erdgeschoss.

Akt 1 ist vorerst frei erkundbar. Alte Rätsel, Gegenstände, Voraussetzungen und Abschlusssequenzen sind entfernt. Nur die Firmenbroschüre aus der Vitrine ist aufnehmbar und im Inventar mit „Schau an“ lesbar. Empfang, Walter und Mitarbeiter haben wiederholbare Gespräche.

Die 2. Etage zeigt von links nach rechts die Teamleiterbürotür, den offen begehbaren Kopier- und Faxraum, Aufzug und Treppenabgang, EMS-Tür und Pausenraumtür. Büro, EMS-Training und Pausenraum haben eigene Innenansichten, Möbelhindernisse und separate Mitarbeiter-Sprites.

Treppen verbinden benachbarte Etagen. In der 1. Etage gibt es getrennte Auf- und Abgänge. Am erreichten Aufzug erscheint die Auswahl Erdgeschoss / 1. Etage / 2. Etage; der aktuelle Standort ist deaktiviert. Abbrechen lässt die Figur vor dem Aufzug stehen. Die Ortsleiste wählt ihr Ziel ohne zusätzliche Rückfrage und nutzt das Raumnetz. Ankunftspunkte unterscheiden Treppe, Aufzug und Zimmertüren. Alle Übergänge erfolgen erst nach dem Hinlaufen; der Aufzug öffnet sichtbar seine Türen. Die Ortsleiste sucht einen Weg durch das Raumnetz, auch zwischen Küche und Räumen im Erdgeschoss. Offene Ausgänge wählen automatisch „Gehe zu“; „Schließe“ und „Schau an“ sind weiterhin bewusst auswählbar. Alle vier Pfeiltasten und Boden-Klicks bewegen die Figur. Möbel sperren ihre Standflächen, Vordergrundteile verdecken die Figur entsprechend ihrer Tiefe.

Der neue Speicherstand übernimmt Broschüre und gültigen Raum aus `success-act1-v1`, solange noch kein neuer Erkundungsspielstand existiert. Frühere Abschlussstände starten im Erdgeschoss. Der alte Spielstand wird weder überschrieben noch gelöscht. Neustart betrifft ausschließlich den neuen Speicherstand. Neue Raum- und Türzustände werden unter demselben Erkundungsschlüssel gespeichert. Vorhandene Spielstände sind weiterhin kompatibel. Der Prolog ist unverändert.

`node test-act1.cjs` prüft freie Interaktionen, Broschüre, Save-Migration, sämtliche Raumverbindungen und Laufziele, Kameragrenzen und Möbelhindernisse. Die vier Prolog-Testdateien prüfen die unveränderte Prologlogik. `node test-browser.cjs` prüft im laufenden lokalen Server alle Etagen, Aufzugziele und Abbruch, Türen, Gespräche, Spielstandübernahme und Neuladen in den neuen Räumen. Es benötigt das Node-Paket `playwright` und installiertes Chrome unter Windows. `QA_URL` überschreibt die Basis-URL, `QA_OUTPUT` das Verzeichnis für Screenshots. Browser-Kontexte sind isoliert; Benutzer-Spielstände werden nicht verändert.

Bilddateien und vollständige Imagegen-Prompts zur 2. Etage: `assets/ACT1-SECOND-FLOOR-ART.md`.

Ein eigenständiger deutscher Point-and-Click-Prototyp mit vier Schauplätzen: Hof, Garage, Scheune und ländliches Haus. Start mit `python -m http.server 8765 --bind 127.0.0.1` in diesem Ordner, dann `http://127.0.0.1:8765/` öffnen. Der lokale Server ist für das Auslesen der transparenten Spritebögen erforderlich; direktes Öffnen über `file://` wird nicht unterstützt.

## Mobile Steuerung

Auf Touch-Geräten im Querformat startet die mobile Oberfläche automatisch: große 16:9-Szene, rechts Aktionen, Inventar, Orte, Hotspots und Menü. Objekte antippen und eine Aktion auswählen; offene Durchgänge werden direkt betreten. Alle zwölf Verben bleiben erreichbar. Bei kleinen überlappenden Zielen erscheint eine Objektauswahl. Inventargegenstand wählen, „Benutze“ oder „Gib“ auswählen und das Ziel antippen; für Kombinationen das Inventar erneut öffnen. Lange Texte werden mit „Weiter“ gelesen. Im Menü lässt sich die klassische Ansicht aktivieren, dort führt „Mobile Ansicht“ zurück. Die Darstellungseinstellung verwendet ausschließlich `success-interface-v1`; Spielstände und Rätsellogik bleiben erhalten.

`mobile.js` und `mobile.css` stellen die gemeinsame Oberfläche bereit. Die beiden Kapitel liefern Adapter für Raum, Gegenstände, beschreibende Objektaktionen und vorhandene Interaktionsfunktionen. Touch-Menüs pausieren laufende Bewegung, führen aber keine Spielaktionen selbst aus. Die Hit-Prüfung erweitert kleine sichtbare Ziele auf mindestens 44 CSS-Pixel, ohne die Weltkoordinaten zu verändern.

`node test-mobile.cjs` prüft mit Playwright/Chrome-Touchemulation den vollständigen Prolog, Kombinationen, überlappende Ziele, verzögerte Interaktionen, Bildschirmdrehung, Dialogseiten, Ansichtswechsel und Speichern sowie Türen, Treppen, Aufzugziele und Broschüre in Akt 1. Ansichtsgrößen: 667×375, 844×390, 932×430 und 1180×820. `QA_URL` und `QA_OUTPUT` funktionieren wie im Desktop-Test. Dies sind Browseremulationen, keine Prüfungen auf physischen Mobilgeräten.

## Klassische Steuerung

Verb wählen, dann ein Objekt anklicken. Die Figur läuft zunächst zum zugehörigen Interaktionspunkt und führt die Aktion erst dort aus. Auf freien Boden klicken, um sich nach links, rechts, hinten oder vorne zu bewegen. Inventargegenstand anklicken, dann ein Objekt oder einen zweiten Gegenstand. Kombinationen innerhalb des Inventars funktionieren direkt. Türen und Ortsnavigation führen über die tatsächlichen Ausgänge zum nächsten Schauplatz. Ein neuer Laufbefehl oder Escape bricht die ausstehende Aktion ab. Hotspots über den Knopf anzeigen. Alle Objektinteraktionen sind mit Tab und Enter erreichbar. Fortschritt wird lokal im Browser gespeichert. Der Tonknopf aktiviert kurze Interaktionsklänge; keine Hintergrundmusik.

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

Komplette Prolog-Rätselkette mit Abschlussdialog, zwölf Verben, Inventar, kontextabhängigen Hinweisen und Speicherstand. Akt 2 und spätere Akte sind noch nicht implementiert. Version 2 verwendet gröbere Pixelhintergründe und einen transparenten Spritebogen mit vier Blickrichtungen und vier Laufphasen pro Richtung. Kalle besitzt Ruhe-, Blinzel- und Gesprächsanimationen. Die Figur wird je nach Raum und Tiefe perspektivisch skaliert. Laufwege nutzen ein Raster mit begehbaren Bodenflächen und Hindernissen; Aktionen werden bei Ankunft einmalig ausgelöst. Rendering auf einem gemeinsamen 480×270-Pixelraster mit ungeglätteter Skalierung. Die Schrift lädt optional von Google Fonts; lokale Ersatzschriften funktionieren offline.

Prüfung der Rätsellogik: `node test-engine.cjs`. Laufwege, Hindernisse, perspektivische Skalierung und verzögerte Aktionen: `node test-movement.cjs`. Sichtbare Objektzustände: `node test-scene-state.cjs`. Der URL-Parameter `?test` startet einen unabhängigen Testspielstand ohne Schreiben in den gespeicherten Nutzerfortschritt.

Version 3 zeigt feinere Pixelgrafik auf einem 640×360-Raster. Handbuch, Autoschlüssel, Kaffeetasse, Putzlappen und Traktorriemen verschwinden aus der Szene, sobald sie mitgenommen werden. Motorhaube, Werkzeugkasten und Truhe haben sichtbare offene und geschlossene Zustände. Der Schraubenschlüssel liegt nur bis zur Entnahme im offenen Kasten. Bildzustände werden aus demselben gespeicherten Spielstand abgeleitet wie die Rätsel. Die Küche verwendet zusätzliche Kollisionsflächen und einen Abstand vor den Möbeln.

Version 4 dreht das Auto in eine Front-Dreiviertelansicht: Front und Motorraum zeigen zum Spieler, das Heck nach hinten rechts. Geschlossene und geöffnete Motorhaube verwenden deckungsgleiche Fahrzeugansichten. Der Interaktionspunkt liegt vor der linken Fahrzeugecke; Laufhindernis und anklickbarer Bereich sind entsprechend angepasst.

Aktuelle Grafikdateien: `assets/locations-v3.png`, `assets/locations-states-v3.png`, `assets/car-front-closed-v4.png`, `assets/car-front-open-v4.png`, `assets/hero-walk.png`, `assets/mechanic-idle.png`. Herkunft und Prompts stehen in `assets/ART-DIRECTION.md`.
