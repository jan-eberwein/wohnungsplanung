#!/usr/bin/env bash
# Läuft auf dem VPS: holt den neuesten Stand und baut den Container neu.
set -euo pipefail

cd "$(dirname "$0")/.."

git pull --ff-only
docker compose build
docker compose up -d
docker image prune -f
