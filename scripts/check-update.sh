#!/usr/bin/env bash
# Läuft per Cron auf dem VPS: prüft, ob es neue Commits auf origin/main gibt,
# und deployt nur dann neu.
set -euo pipefail

cd "$(dirname "$0")/.."

git fetch origin main --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "[$(date -Is)] Neuer Stand ($REMOTE) — deploye …"
  ./scripts/deploy.sh
  echo "[$(date -Is)] Deploy fertig."
fi
