# The Secret of My Success – Prolog und Akt 1

## Kapitelwahl

Beim Start steht die Auswahl zwischen Prolog und Akt 1 zur Verfügung. Beide Kapitel sind frei spielbar. Über „Kapitel“ kann jederzeit gewechselt werden. Bestehende Prolog-Spielstände bleiben unter `success-prolog-v1` erhalten; Akt 1 verwendet `success-act1-v1`. Nach dem Prolog führt ein Link direkt zu Akt 1. `act1.html` öffnet das neue Kapitel direkt.

## Akt 1: Herzlich willkommen. Personaleingang hinten.

Drei zusammenhängend erreichbare Schauplätze: ein 1920 × 540 Weltpunkte breites Erdgeschoss mit 960 × 540 Sichtfenster, Lieferhof und Technikraum. Die Kamera folgt horizontal; Start links bei Eingang, Empfang und Aufzug. Rechts folgen Treppenhaus, WC, Technikraum und der Nebeneingang zum Hof. Die früher getrennte Pförtnerloge und Personalschleuse sind in das Erdgeschoss integriert. Vorhandene Spielstände aus diesen Ansichten werden ins Erdgeschoss übernommen, ohne Rätsel-Fortschritt zu löschen. Die Abschlusssequenz spielt im Lastenaufzug. Enthält Walter, Empfang, Übungsbesucher, Verkäufer, Technikerin, Lieferfahrer, Direktor, Rita und die optionale Begegnung mit Mara. Frau Seidel und die drei Bergers werden über das Haustelefon erreicht.

„Rede mit“ öffnet zusätzliche Gesprächsthemen unter dem Dialog; „Benutze“ öffnet das Haustelefon. Dokumente im Inventar mit „Schau an“ lesen. Das Notizbuch sammelt Hinweise. Ortswechsel und Interaktionen werden erst nach dem Hinlaufen ausgeführt. Gesperrte Zugänge werden geprüft; falsche Berger-Anrufe und Schlüssel verursachen keine Sackgassen.

Boden anklicken oder Randpfeile verwenden, um durch das Erdgeschoss zu gehen. Links/rechts-Pfeiltasten laufen solange sie gehalten werden. Hotspots und Figuren scrollen mit dem Hintergrund; Bedienleiste und Dialog bleiben fest. „Gehe zu“ oder „Benutze“ auf Nebeneingang/Techniktür betritt den jeweiligen Raum erst nach dem Hinlaufen. Die Ortsleiste führt ebenfalls über die Türen. Treppenhaus und WC sind aktuell Kulisse mit Untersuchungstexten, keine zusätzlichen Räume.

### Lösung Akt 1

1. Einladung anschauen, zum Empfang gehen. Telefon benutzen und Seidel mit Personalnummer 4711 kontaktieren. Walter ansprechen, Ausweis erhalten, Übergabe erklären lassen.
2. Übungsbesucher nach Anlass und Abteilung fragen. Terminübersicht und Telefonverzeichnis lesen. Thomas Berger / IT anrufen. Besucherausweis B nehmen und dem Besucher geben.
3. Seidel zum unangemeldeten Besucher anrufen. Verkäufer am Haupteingang auf einen regulären Termin verweisen. Optional Mara die Tür aufhalten.
4. Technikerin im Lieferhof ansprechen. Serviceauftrag im Inventar lesen und mit Wartungsbuch am Empfang abgleichen. Haustechnik anrufen, Technikausweis nehmen und der Technikerin geben.
5. Vollständigen Lieferschein lesen. Seidel zum Zielort anrufen. Schutzmatten nehmen und mit Aufzug am Haupteingang benutzen. Beim Fahrer den Transport freigeben.
6. Mitarbeiterausweis mit Leser rechts im Erdgeschoss benutzen. Aushang lesen. Schlüsselbuch am Empfang benutzen. Am Schlüsselbrett T-03 / Kühlung nehmen und mit Techniktür im Erdgeschoss benutzen.
7. Technikraum betreten und die Technikerin ansprechen. Anschließend Direktor am Haupteingang ansprechen, Walter die Schicht übergeben und mit Rita sprechen. Lastenaufzug im Technikraum benutzen.

`node test-act1.cjs` prüft die vollständige Handlung, Voraussetzungen, Fehlversuche, visuelle Zustände, Speicherung und alle Laufziele. Akt 2 ist noch nicht spielbar. Die tatsächliche Spielzeit hängt vom Erkunden und der Nutzung der Hinweise ab; die im Konzept genannten 45–60 Minuten sind kein gemessener Wert.

Ein eigenständiger deutscher Point-and-Click-Prototyp mit vier Schauplätzen: Hof, Garage, Scheune und ländliches Haus. Start mit `python -m http.server 8765 --bind 127.0.0.1` in diesem Ordner, dann `http://127.0.0.1:8765/` öffnen. Der lokale Server ist für das Auslesen der transparenten Spritebögen erforderlich; direktes Öffnen über `file://` wird nicht unterstützt.

## Steuerung

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
