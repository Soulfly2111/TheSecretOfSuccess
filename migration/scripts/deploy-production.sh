#!/usr/bin/env bash
set -euo pipefail
site=/var/www/casanova-studio
previous=$(readlink -f "$site/current")
release="$site/releases/20261004-phaser-live"
game=the-secret-of-my-success
test "$previous" = "$site/releases/20261004-phaser-preview"
test ! -e "$release"
test -f /tmp/success-preview.sha256
test -f /tmp/success-migration-original.sha256
test -f /tmp/success-migration-sites-before.sha256

# Hardlink untouched files. Only the two regular HTML files are replaced.
cp -al "$previous" "$release"
test "$release/$game" = "$site/releases/20261004-phaser-live/$game"
rm -f "$release/$game/index.html" "$release/$game/act1.html"
cp "$previous/$game/migration/index.html" "$release/$game/index.html"
cp "$previous/$game/migration/act1.html" "$release/$game/act1.html"
for source in "$previous/$game/migration/assets/"*.js "$previous/$game/migration/assets/"*.css; do
  test -f "$source"
  target="$release/$game/assets/$(basename "$source")"
  test ! -e "$target"
  ln "$source" "$target"
done

# Both regular chapters must match the tested preview, with other site files intact.
(cd "$release/$game" && sha256sum -c /tmp/success-preview.sha256 > /tmp/success-production-build-check.txt)
(cd "$release" && grep -vE '  \./the-secret-of-my-success/(index|act1)\.html$' /tmp/success-migration-original.sha256 | sha256sum -c > /tmp/success-production-unchanged-check.txt)
sha256sum -c /tmp/success-migration-sites-before.sha256 > /tmp/success-production-sites-check.txt
ln -s "$release" "$site/current-live-next"
mv -Tf "$site/current-live-next" "$site/current"
printf 'Live release: %s\nPrevious release: %s\n' "$release" "$previous"
