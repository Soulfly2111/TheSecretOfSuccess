#!/usr/bin/env bash
set -euo pipefail

site=/var/www/casanova-studio
game=the-secret-of-my-success
previous=$(readlink -f "$site/current")
release="$site/releases/20261004-front-priority"
archive=/tmp/success-front-priority.tar.gz
manifest=/tmp/success-front-priority.sha256

test "$previous" = "$site/releases/20261004-phaser-live"
test ! -e "$release"
test -f "$archive"
test -f "$manifest"
test -f /tmp/success-migration-original.sha256
test -f /tmp/success-migration-sites-before.sha256

# Start with hardlinks to the known-good release. Unlink every replaced file
# before extraction so rollback files in the previous release cannot change.
cp -al "$previous" "$release"
migration="$release/$game/migration"
while IFS= read -r member; do
  test -n "$member"
  case "$member" in
    /*|*..*) exit 1 ;;
  esac
  rm -f -- "$migration/$member"
done < <(tar -tzf "$archive")
tar -xzf "$archive" -C "$migration"

# Publish the same verified build at the regular chapter URLs.
rm -f "$release/$game/index.html" "$release/$game/act1.html"
cp "$migration/index.html" "$release/$game/index.html"
cp "$migration/act1.html" "$release/$game/act1.html"
for source in "$migration/assets/"*.js "$migration/assets/"*.css; do
  test -f "$source"
  target="$release/$game/assets/$(basename "$source")"
  if test -e "$target"; then
    cmp "$source" "$target"
  else
    ln "$source" "$target"
  fi
done

(cd "$migration" && sha256sum -c "$manifest" > /tmp/success-front-migration-check.txt)
(cd "$release/$game" && sha256sum -c "$manifest" > /tmp/success-front-regular-check.txt)
(cd "$release" && grep -vE '  \./the-secret-of-my-success/(index|act1)\.html$' /tmp/success-migration-original.sha256 | sha256sum -c > /tmp/success-front-unchanged-check.txt)
sha256sum -c /tmp/success-migration-sites-before.sha256 > /tmp/success-front-sites-check.txt

ln -s "$release" "$site/current-front-next"
mv -Tf "$site/current-front-next" "$site/current"
printf 'Live release: %s\nPrevious release: %s\n' "$release" "$previous"
