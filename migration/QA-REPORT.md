# Prüfbericht – 4. Oktober 2026

Ein abschließendes `npm ci` mit Typprüfung, Validierung, Build und acht Tests ist bestanden. Alle 39 Builddateien haben nach der frischen Installation dieselben SHA-256-Werte wie der veröffentlichte Build.

## Getesteter Stand

Vite 7.3.6, Phaser 3.90.0, TypeScript 5.9.3, Node 24.19.0, Playwright 1.62.1, installiertes Chrome unter Windows. Produktionsbuild auf Port 8771; Referenz auf Port 8765. Browsertests laufen in isolierten Kontexten mit eigenen Spielständen.

## Ergebnisse

| Prüfung                      | Ergebnis                                                                                                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsc --noEmit` mit strict    | Bestanden für TypeScript einschließlich Tests; JavaScript-Brücke nicht typgeprüft                                                                                      |
| JSON-Buildvalidierung        | Bestanden: Befehle/Arity, Programme, Bindungen, statische Items, Räume, Geometrie, Eintritte, Verbindungen                                                             |
| Acht Node-Tests              | Bestanden: Regeln und Mutationsergebnisse beider Kapitel gegen Referenz, Spielstände, Kontextaktionen, Wegfindung, Koordinaten, Prolog-Sichtbarkeit, Fehlervalidierung |
| Prolog per Touch             | Vollständig bestanden: Wasser, Kaffee, Werkzeugfreigabe, Keilriemenkombination und Autoreparatur; Laden und fünf Größen                                                |
| Akt 1 per Touch und Maus     | Bestanden: Begrüßung, Walter-Nachfrage, versteckte Karte, Schublade/Messer, Rückgabe, Broschüre, Fotoausweis, zehn Räume, Türen und Speichern                          |
| Foto zuerst, Walter danach   | Bestanden: frühe Fotos, einzelne Uploads, wiederholter Upload, frühe Kartenbergung, beide Aufgaben abgeschlossen                                                       |
| Direktbedienung              | Bestanden: Mouseover, Links-/Rechtsklick, neuer Laufauftrag, offene/geschlossene Türen, „Aktionen“, Haltegeste, Bewegungsabbruch und zweite Berührung                  |
| Oberfläche/Tastatur          | Bestanden bei 667×375, 844×390, 932×430, 1180×820, 1440×900; Radbegrenzung, Inventarüberlauf, Escape, Umschalt+F10, Lupe/Leertaste, Abbruch/Fokusverlust               |
| Menüs während Begrüßung      | Bestanden: Pause/Fortsetzen, Kapitelwahl, Hinweis, Neustartbestätigung                                                                                                 |
| Aufzüge und Druckfortsetzung | Alle sechs gerichteten Fahrten und Abbruch bestanden; pending Druck wird nach Laden beendet, Ausweis genau einmal, Originalspielstand unverändert                      |
| Produktionsstart online      | Beide Kapitel ohne Browserfehler oder fehlende Ressourcen; Rendererkennung `phaser3`                                                                                   |
| npm audit                    | Keine gemeldeten Schwachstellen; esbuild auf 0.28.1 festgelegt                                                                                                         |
| Bestehender Webroot/Apache   | Alle vorab erfassten SHA-256-Prüfsummen nach Vorschauveröffentlichung unverändert                                                                                      |
| Weitere Domains              | HTTP 200 nach Weiterleitung für bodydashboard.de, die-bauern.de, darkearth.de, die-bauern-band.de und heinerniehues.de                                                 |

Touch ist Browseremulation, keine Prüfung auf einem echten Mobilgerät. Screenshots wurden auf Darstellung geprüft; kein vollständiger automatisierter Pixelvergleich sämtlicher Animationseinzelbilder. Gesamt-RAM und GPU-Speicher wurden nicht gemessen. Der Leistungstest ist im README mit seinen Grenzen beschrieben.

## Veröffentlichter Build

[Kapitelwahl/Prolog](https://casanova-studio.de/the-secret-of-my-success/migration/), [Akt 1](https://casanova-studio.de/the-secret-of-my-success/migration/act1.html).

Release `20261004-phaser-preview`, Vorschauarchiv SHA-256:
`2bea99880c1581778b05132fb42c18869aa5b8827be5d0740a81d1247770176c`.

Die reguläre Spielversion ist weiter [hier](https://casanova-studio.de/the-secret-of-my-success/) erreichbar. Kern, JSON-Regeln, Wegfindung, Speicherformat und Phaser-Anbindung sind übertragen. Die bisherige JavaScript-Oberfläche und Pixelzeichner bleiben eine ausdrücklich dokumentierte Brücke. Diese Vorschau ist daher noch keine vollständig native TypeScript-/Phaser-Implementierung.
