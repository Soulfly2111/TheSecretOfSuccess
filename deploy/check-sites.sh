#!/bin/bash
set -eu
for url in https://bodydashboard.de/ https://darkearth.de/ http://die-bauern.de/ https://die-bauern-band.de/ https://heinerniehues.de/; do
 curl -sS -L --max-time 25 -o /dev/null -w '%{url_effective} %{http_code}\n' "$url"
done
curl -sS --max-time 15 https://bodydashboard.de/api/health
