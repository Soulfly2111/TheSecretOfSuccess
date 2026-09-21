# The Secret of My Success – Prolog

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

Komplette Prolog-Rätselkette mit Abschlussdialog, zwölf Verben, Inventar, kontextabhängigen Hinweisen und Speicherstand. Die folgenden Akte sind nicht implementiert. Version 2 verwendet gröbere Pixelhintergründe und einen transparenten Spritebogen mit vier Blickrichtungen und vier Laufphasen pro Richtung. Kalle besitzt Ruhe-, Blinzel- und Gesprächsanimationen. Die Figur wird je nach Raum und Tiefe perspektivisch skaliert. Laufwege nutzen ein Raster mit begehbaren Bodenflächen und Hindernissen; Aktionen werden bei Ankunft einmalig ausgelöst. Rendering auf einem gemeinsamen 480×270-Pixelraster mit ungeglätteter Skalierung. Die Schrift lädt optional von Google Fonts; lokale Ersatzschriften funktionieren offline.

Prüfung der Rätsellogik: `node test-engine.cjs`. Laufwege, Hindernisse, perspektivische Skalierung und verzögerte Aktionen: `node test-movement.cjs`. Sichtbare Objektzustände: `node test-scene-state.cjs`. Der URL-Parameter `?test` startet einen unabhängigen Testspielstand ohne Schreiben in den gespeicherten Nutzerfortschritt.

Version 3 zeigt feinere Pixelgrafik auf einem 640×360-Raster. Handbuch, Autoschlüssel, Kaffeetasse, Putzlappen und Traktorriemen verschwinden aus der Szene, sobald sie mitgenommen werden. Motorhaube, Werkzeugkasten und Truhe haben sichtbare offene und geschlossene Zustände. Der Schraubenschlüssel liegt nur bis zur Entnahme im offenen Kasten. Bildzustände werden aus demselben gespeicherten Spielstand abgeleitet wie die Rätsel. Die Küche verwendet zusätzliche Kollisionsflächen und einen Abstand vor den Möbeln.

Version 4 dreht das Auto in eine Front-Dreiviertelansicht: Front und Motorraum zeigen zum Spieler, das Heck nach hinten rechts. Geschlossene und geöffnete Motorhaube verwenden deckungsgleiche Fahrzeugansichten. Der Interaktionspunkt liegt vor der linken Fahrzeugecke; Laufhindernis und anklickbarer Bereich sind entsprechend angepasst.

Aktuelle Grafikdateien: `assets/locations-v3.png`, `assets/locations-states-v3.png`, `assets/car-front-closed-v4.png`, `assets/car-front-open-v4.png`, `assets/hero-walk.png`, `assets/mechanic-idle.png`. Herkunft und Prompts stehen in `assets/ART-DIRECTION.md`.
