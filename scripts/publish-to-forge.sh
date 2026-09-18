#!/usr/bin/env bash
# Pushes one kit of this repository to the platform's Forgejo template repo
# (maic-kits/kit-<name>), which is what the platform forks for each company.
# Maintainers only: needs FORGE_URL and FORGE_TOKEN in the environment.
set -euo pipefail
KIT="${1:?usage: publish-to-forge.sh <vitrine|boutique>}"
: "${FORGE_URL:?FORGE_URL (e.g. http://forge.example:3003)}"; : "${FORGE_TOKEN:?FORGE_TOKEN}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"; [ -d "$HERE/$KIT" ] || { echo "no kit $KIT"; exit 1; }
T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
rsync -a --exclude node_modules --exclude dist --exclude .astro "$HERE/$KIT/" "$T/"
cd "$T" && git init -q -b main && git add -A && git -c user.name=maic-kits -c user.email=kits@myaicompany.ch commit -qm "kit-$KIT from maic-kits $(git -C "$HERE" rev-parse --short HEAD)"
git push -q --force "${FORGE_URL/:\/\//://maic-admin:${FORGE_TOKEN}@}/maic-kits/kit-$KIT.git" main
curl -sf -X PATCH -H "Authorization: token $FORGE_TOKEN" -H "Content-Type: application/json" \
  "$FORGE_URL/api/v1/repos/maic-kits/kit-$KIT" -d '{"template": true}' >/dev/null
echo "kit-$KIT published to Forgejo"
