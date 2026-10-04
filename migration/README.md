# Spielbare TypeScript-/Phaser-Migration

Dieser Build enthält den vollständigen Prolog und alle zehn Räume von Akt 1 einschließlich Walter und Marmor-Passfoto. Er läuft unter den regulären Spieladressen und unter der separaten Vorschau. Die früheren JavaScript-Quellen bleiben im Repository als Referenz für Paritätstests. Es wurden keine neuen Spielinhalte ergänzt.

## Status und Aufbau

| Bereich                             | Umsetzung                                                                                                 |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Adventure-Kern                      | Strict TypeScript, ohne DOM oder Phaser; ein begrenzter JSON-Interpreter für beide Kapitel                |
| Inventar, Rätsel, Dialoge, Hinweise | Aus den Referenzregeln in JSON übertragen; Ergebnisse und Zustandsänderungen gegen die Referenz getestet  |
| Räume und Navigation                | JSON für Laufbereiche, Hindernisse, Interaktionspunkte, Eintrittspunkte, Kamera und Raumverbindungen      |
| Wegfindung                          | Bestehendes A\* in TypeScript, ohne Physik; Pfade gegen die Referenz verglichen                           |
| Begrüßung und Walter-Gespräch       | TypeScript-Ablaufsteuerung, bestehende Dialoganzeige                                                      |
| Darstellung                         | Phaser 3 verwaltet Szene, Canvas-Texturen, Ebenen, Tiefenreihenfolge und Kamera                           |
| Oberfläche und Pixelzeichnung       | Vorhandene JavaScript-Module als ES-Modul-Brücke beibehalten; HTML/CSS für Eingaben, Inventar und Dialoge |
| Build                               | Vite, festgeschriebene Abhängigkeiten, TypeScript strict; statische Ausgabe in `dist`                     |

Die Migration ist **noch keine vollständige Umwandlung sämtlicher Dateien in TypeScript**. `allowJs` erlaubt die bestehende Oberflächen- und Zeichenbrücke, `checkJs` ist ausgeschaltet. Figurenanimationen und spezielle Objektbilder werden weiterhin durch die bewährten Pixelzeichner auf getrennte Phaser-Texturen gezeichnet. Native Phaser-Spriteanimationen und eine vollständig typisierte Controller-/Oberflächenschicht sind weitere Migrationsschritte. Diese Einschränkung wird nicht durch `@ts-nocheck` oder ein abgeschaltetes `strict` verdeckt.

`src/core` enthält die unabhängige Logik und Wegfindung, `src/content` die Inhalte und Validierung, `src/presentation` die Phaser-Anbindung, Bildauswahl und Begrüßungssequenz. `src/shell` enthält die erhaltene Oberfläche und Pixelzeichner. Phaser-Eingaben sind deaktiviert; HTML verarbeitet Maus, Touch und Tastatur genau einmal.

## Entwicklung

Node.js 22 oder neuer mit npm. Im Verzeichnis `migration`:

```sh
npm ci
npm run dev -- --port 8770
npm run typecheck
npm run validate
npm test
npm run build
npm run promote:static
npm run preview -- --port 8771
```

`index.html?chapter=prolog` startet den Prolog; `act1.html` Akt 1. `npm run build` prüft Typen und Inhalte, kopiert die vorhandenen Bilder aus `../assets` und erstellt die statische Ausgabe. `npm run promote:static` vergleicht die bestehenden Grafiken per SHA-256 und kopiert HTML und Bundles an die Stammadressen des Repositorys. Auf dem Webserver wird kein Node-Dienst benötigt. `base: './'` ermöglicht den Betrieb in einem Unterordner.

## JSON-Inhalte bearbeiten

`*-world.json` beschreibt die Räume. Die importierten Objektlisten enthalten `[id, Name, x%, y%, Breite%, Höhe%, Interaktions-x, Interaktions-y, Blickrichtung]`. `geometry` enthält die Laufpolygone und Möbelrechtecke. `connections` verweist auf einen vorhandenen Zielraum und dessen benannten Eintrittspunkt. `items.json` enthält Gegenstandskennungen und Namen. `actions.json` enthält die Kontextaktionen und gemeinsame Gruppen.

`*-logic.json` enthält benannte Programme mit Parametern und begrenzten Befehlen. Beispiel für eine Prüfung ohne ausführbaren JavaScript-Code:

```json
{
  "kind": "branch",
  "condition": { "op": "has", "args": [{ "literal": "knife" }] },
  "yes": [{ "kind": "return", "value": { "literal": "Das Tafelmesser ist dabei." } }],
  "no": [{ "kind": "return", "value": { "literal": "Das Messer fehlt." } }]
}
```

Befehle sind `branch`, `set`, `let`, `return` und `effect`. Ausdrücke erlauben Literale, Referenzen, Listen, Records und die fest definierten Operationen des Interpreters. Programmaufrufe nutzen `call:Programmname`. Der Laufzeitkern verwendet kein `eval`, keine dynamisch erzeugten Funktionen und keinen Code aus JSON. Aufruftiefe und Operationszahl sind begrenzt; gefährliche Objektfelder werden abgewiesen.

Die Buildvalidierung prüft Befehle, Operationen, Programm- und Variablenreferenzen, statische Inventarreferenzen, Raumverbindungen, Eintrittspunkte, Geometrie und eindeutige Hotspots. Dynamische Ziele werden durch die vorhandenen Kapitelregeln und Paritätstests abgesichert. Für komplexe neue Abläufe kann die Engine explizit registrierte TypeScript-Erweiterungen verwenden; derzeit werden keine benötigt.

Die Importskripte sind einmalige Werkzeuge zur Ableitung aus der unveränderten Referenz, **keine Buildschritte**. Insbesondere `import-content.cjs` und `port-shell.cjs` nicht erneut ausführen: Sie überschreiben bereits überarbeitete Inhalte beziehungsweise Brückendateien. Das Importwerkzeug verarbeitet vertrauenswürdigen Repository-Code; dessen AST-Konvertierung und statische Extraktion gehören nicht zur ausgelieferten Laufzeit.

## Koordinaten und Grafik

Referenz-Weltkoordinaten bleiben erhalten: Sichtfenster 960 × 540; Panoramen 1920 × 540. Interaktionspunkte, Figurenfüße und Möbel verwenden diese Weltpunkte. Hotspotrechtecke sind Prozentwerte relativ zur vollständigen Raumgröße. HTML positioniert sie mit Kameraoffset innerhalb des Sichtfensters.

Phaser zeichnet im logischen Raster 640 × 360; der zentrale Adapter bildet Weltpunkte mit Faktor 2/3 ab. Panoramen sind entsprechend 1280 × 360. Kamera und Texturen verwenden denselben Faktor. CSS skaliert die Szene im Verhältnis 16:9 mit Pixelinterpolation. Hintergrund, Figuren und Vordergrund sind getrennte Phaser-Ebenen; Dunkelmaske, Türen, Schublade und Motorhaube behalten die bisherigen Zeichenoperationen.

Bilddateien werden nach Kapitel und betretenem Raum geladen. Geladene Bilder werden innerhalb des Kapitels gehalten; es besteht noch kein Textur-Entladebudget. Bei erstmaligem Raumwechsel können Bilder kurz nachladen. Die Canvas-Brücke zeichnet ihre Ebenen weiterhin jedes Bild neu; daraus folgt keine allgemeine Leistungsverbesserung.

## Spielstände und Rückwechsel

Neue Schlüssel: `success-migration-v1-prolog` und `success-migration-v1-act1`. Das JSON-Format besitzt `schemaVersion`, `chapter`, `savedAt` und `state`.

Wenn kein eigener gültiger Spielstand vorliegt, werden `success-prolog-v1`, `success-act1-exploration-v1` beziehungsweise der alte `success-act1-v1` gelesen. Die Originalschlüssel werden weder überschrieben noch entfernt. Türen, Licht, Broschüre und Rätselzustände bleiben erhalten; alte Abschlussstände beginnen im Erdgeschoss. Unterbrochene Begrüßungen beginnen erneut. Vorhandene Foto-/Druckzustände werden normalisiert und über die bestehenden Abläufe fortgesetzt. Neustart betrifft nur den Migrationsstand.

Ein Rückwechsel zur bisherigen Spielversion verwendet deren unveränderten Originalstand. Fortschritte, die ausschließlich in der Vorschau entstehen, werden noch nicht zurückexportiert.

## Prüfungen

`npm test`: Logikparität gegen die Referenz für beide Kapitel, Kontextaktionen, Spielstandimport, Validierungsfehler und Wegfindungsparität. Diese Tests benötigen bewusst die unveränderten Referenzdateien eine Ebene oberhalb.

Browserprüfung mit `playwright` und Chrome unter Windows. `QA_URL` zeigt auf den **fertigen Produktionsbuild**, damit HMR keine laufenden Tests unterbricht. Beispiel in PowerShell:

```powershell
$env:QA_URL='http://127.0.0.1:8771/'
node tests/smoke.cjs
node tests/browser/test-radial-prolog.cjs
node tests/browser/test-radial-act1.cjs
node tests/browser/test-photo-first.cjs
node tests/browser/test-direct-input.cjs
node tests/browser/test-radial-ui.cjs
node tests/browser/test-pause.cjs
node tests/browser/test-lifts-resume.cjs
```

Die Tests verwenden sichtbare Bedienelemente und die schreibgeschützte `window.AdventureGame`-Schnittstelle für geklonte Zustandsaufnahmen/Routen. Private globale Variablen oder mutationsfähige Debugbefehle werden nicht vorausgesetzt. Save-Fixtures werden vor dem Start in isolierten Browserkontexten eingespielt.

Bestanden: vollständiger Kaffee-/Werkzeug-/Autoreparatur-Prolog; Walter und Foto per Maus und Touch; beide Rätselreihenfolgen, frühe Fotos und Kartenbergung, einzelne/wiederholte Uploads; Räume, Türen, alle sechs Aufzugfahrten und Abbruch; unterbrochener Druck ohne Duplikate; Reinigungsraum; Spielstände; direkte Maus-/Touchsteuerung; fünf Größen 667×375, 844×390, 932×430, 1180×820 und 1440×900; Randpositionierung, Tastatur, Lupe und Menüpause. Ergebnisse stehen in [QA-REPORT.md](QA-REPORT.md).

Touchtests sind **Chrome-Browseremulation**, keine Tests auf einem echten Smartphone. Bildvergleiche und Screenshots liegen lokal unter `.qa` und werden nicht mitveröffentlicht.

## Gemessene Grenzen

Lokaler Chrome, Akt-1-Start bei 844×390, drei frische Kontexte, Ressourcen nach 2,5 Sekunden; ohne Netzwerkkonditionierung. Referenz: 48 Anfragen und 58,55 MB. Migration: 15 Anfragen und 15,04 MB (etwa 74 % weniger Anfangsdaten). Median `DOMContentLoaded`: Referenz 154,5 ms, Migration 230,5 ms. Die Migration startet in dieser Messung **nicht schneller**. Dies ist keine Messung bis zur vollständig spielbereiten Szene.

Gemeldeter JavaScript-Heap: Referenz 2,18–28,07 MB, Migration 21,85–28,58 MB. Die starke Streuung erlaubt keine belastbare Speicherverbesserungsbehauptung. Bild-, Canvas- und GPU-Speicher sind nicht enthalten; Gesamtspeicher und Leistung auf echten Mobilgeräten sind noch offen. `tests/metrics.cjs` reproduziert die Messung, wenn der frühere Referenzstand (Commit `c819ec8`) auf Port 8765 und der Migrationsbuild auf Port 8771 erreichbar sind.

## Veröffentlichung

Der geprüfte Build liegt an den regulären Adressen `/the-secret-of-my-success/` und `/the-secret-of-my-success/act1.html`; die Vorschau unter `/the-secret-of-my-success/migration/` bleibt erreichbar. Release `20261004-phaser-live` enthält dieselben 39 verifizierten Builddateien. Der vorherige Release `20261004-phaser-preview` bleibt für den Rückwechsel verfügbar. Apache-Konfiguration und andere Domains wurden nicht verändert.

Die [reguläre Kapitelwahl](https://casanova-studio.de/the-secret-of-my-success/) und [Akt 1](https://casanova-studio.de/the-secret-of-my-success/act1.html) sind veröffentlicht. Die getrennte [Vorschau](https://casanova-studio.de/the-secret-of-my-success/migration/) bleibt ebenfalls erreichbar.

`scripts/package-preview.cjs` erzeugt ein Archiv der Builddateien und ein SHA-256-Manifest einschließlich Grafikdateien. `scripts/deploy-preview.sh` und `scripts/deploy-production.sh` beschreiben die verwendeten Release-Schritte. Die Releases verwenden Hardlinks auf unveränderte Dateien. **Diese verknüpften Dateien niemals im Release bearbeiten**; neue Releases mit eigenen Dateien anlegen. Alle anderen Webdateien und Apache-Sites wurden nach Veröffentlichung per SHA-256 unverändert bestätigt; die weiteren Domains antworten erfolgreich.

Die reguläre Version wurde auf Wunsch des Nutzers nach den Funktions- und Browserprüfungen umgestellt. Die JavaScript-Brücke für Oberfläche und Pixelzeichnung bleibt als dokumentierter weiterer Migrationsschritt bestehen.
