# Casanova Studio

Live: https://casanova-studio.de/ – Spiel: https://casanova-studio.de/the-secret-of-my-success/

Apache auf 185.207.107.160. Ausschließlich eigene Site `casanova-studio.conf`; andere VirtualHosts bleiben unverändert. Webroot `/var/www/casanova-studio/current` verweist auf ein versioniertes Verzeichnis unter `/var/www/casanova-studio/releases/`.

Release-Aufbau: Inhalt von `site/` ins Release-Hauptverzeichnis kopieren; Spieldateien `index.html`, `style.css`, `engine.js`, `movement.js`, `scene-state.js`, `renderer.js`, `game.js`, `chapters.js`, `act1.html`, `act1.js`, `act1-engine.js`, `act1-world.js`, `act1-renderer.js`, `act1-cast.js`, `act1-story.js`, `act1.css`, `mobile.js`, `mobile.css`, `dialogue.js`, `speakers.js`, `dialogue.css` und `assets/` unter `the-secret-of-my-success/` kopieren. Keine Zugangsdaten, Tests oder Deployment-Dateien im öffentlichen Webroot.

Für Updates neues Release-Verzeichnis anlegen, Dateien übertragen, prüfen und `current` mittels temporärem Symlink und `mv -Tf` atomar umschalten. Rückkehr zum vorherigen Release durch dieselbe Symlink-Umschaltung. Für reine Inhaltsupdates kein Apache-Reload nötig.

HTTPS: Let's Encrypt für casanova-studio.de und www.casanova-studio.de. Webroot-Challenge wird von der HTTP-Weiterleitung ausgenommen. Zertifikatserneuerung über bestehenden Certbot-Timer; Deploy-Hook lädt Apache nach erfolgreicher Erneuerung neu.

Vor/nach Deployment `bash deploy/check-sites.sh` ausführen. Apache-Konfigurationsänderungen nur nach erfolgreichem `apachectl configtest` mittels `systemctl reload apache2` aktivieren. Der Erstdeploy wurde mit unveränderten Konfigurations-Prüfsummen aller zuvor vorhandenen Sites kontrolliert.

Spielstände bleiben lokal im jeweiligen Browser. Ein Spielstand von localhost wird nicht automatisch auf die öffentliche Domain übertragen.

## Release 2026-09-29

Aktives Release: `/var/www/casanova-studio/releases/20260929-dialogue-v3`. Enthält die gemeinsame Dialoganzeige, Figurenfarben und den Onkel-Sprechbogen mit fester Skalierung. Alle 58 veröffentlichten Dateien wurden vor dem Umschalten per SHA-256 geprüft. Vorheriges Release für Rollback: `/var/www/casanova-studio/releases/20260928-01`. Umschaltung erfolgte atomar ohne Apache-Konfigurationsänderung.

## Reinigungsraum 2026-09-29

Release: `/var/www/casanova-studio/releases/20260929-cleaning`. Vorheriges Release: `20260929-dialogue-v3`. Sieben geänderte öffentliche Dateien werden per SHA-256 geprüft; Umschaltung ohne Apache-Änderung. Desktop- und Touch-Browseremulation prüfen Licht, Speicherstand und Rückweg.
