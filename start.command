#!/bin/bash

# ─────────────────────────────────────────────
#  CDGI SportsSphere — One-Click Launcher
# ─────────────────────────────────────────────

cd "$(dirname "$0")"

# Kill any process already on port 3000
lsof -ti :3000 | xargs kill -9 2>/dev/null

echo ""
echo "  ⚡  CDGI SportsSphere"
echo "  Installing dependencies..."
echo ""

npm install

echo ""
echo "  🚀  Starting dev server..."
echo ""

# Start server in background, wait for ready, then open browser
npm run dev &
SERVER_PID=$!

# Wait until port 3000 is accepting connections (max 30s)
for i in $(seq 1 30); do
  if nc -z localhost 3000 2>/dev/null; then
    break
  fi
  sleep 1
done

# Open in default browser
open http://localhost:3000

echo ""
echo "  ✅  App running at http://localhost:3000"
echo "  Press Ctrl+C to stop."
echo ""

# Keep terminal open and wait for server
wait $SERVER_PID
