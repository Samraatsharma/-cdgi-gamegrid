#!/bin/bash

# ──────────────────────────────────────────────────────────────────────────
#  🏆 SportsSphere — One-Click Launcher
# ──────────────────────────────────────────────────────────────────────────

# Ensure we are in the project directory
cd "$(dirname "$0")"

# ANSI Color Codes for a premium look
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'
BOLD='\033[1m'

clear
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${BOLD}⚡ CDGI SportsSphere — Professional Launcher${RESET}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# 1. Install Dependencies
echo -e "  ${BLUE}📦  Phase 1: Syncing Dependencies...${RESET}"
npm install
if [ $? -ne 0 ]; then
    echo -e "  ${YELLOW}❌  Failed to install dependencies. Please check your node/npm installation.${RESET}"
    exit 1
fi
echo -e "  ${GREEN}✅  Dependencies up to date.${RESET}"
echo ""

# 2. Check for .env.local
if [ ! -f ".env.local" ]; then
    echo -e "  ${YELLOW}⚠️   Warning: .env.local not found. Creating default development configuration...${RESET}"
    echo "DATABASE_URL=\"file:./database/sports.db\"" > .env.local
fi

# 3. Start Development Server
echo -e "  ${BLUE}🚀  Phase 2: Starting Development Server...${RESET}"
# Kill any existing process on port 3000 to avoid conflicts
lsof -ti :3000 | xargs kill -9 2>/dev/null

# Start Next.js in the background
npm run dev > /dev/null 2>&1 &
SERVER_PID=$!

# 4. Wait for Server & Launch Browser
echo -e "  ${BLUE}🌐  Phase 3: Launching Browser...${RESET}"
echo -ne "      Waiting for server to initialize..."

# Wait up to 30 seconds for the port to be active
for i in {1..30}; do
    if nc -z localhost 3000 2>/dev/null; then
        echo -e " ${GREEN}Ready!${RESET}"
        break
    fi
    echo -ne "."
    sleep 1
done

# Launching search for "Bro Browser" (Assuming Brave or Default)
echo -e "      Opening ${BOLD}Bro Browser${RESET}..."

# Try Brave Browser first (common developer 'Bro' browser), then fallback to Chrome, then default
if [ -d "/Applications/Brave Browser.app" ]; then
    open -a "Brave Browser" http://localhost:3000
elif [ -d "/Applications/Google Chrome.app" ]; then
    open -a "Google Chrome" http://localhost:3000
else
    open http://localhost:3000
fi

echo ""
echo -e "  ${GREEN}✨  SportsSphere is now live at http://localhost:3000${RESET}"
echo -e "      ${BOLD}Keep this window open${RESET} to maintain the server connection."
echo -e "      Press ${YELLOW}Ctrl+C${RESET} to terminate the session."
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# Handle Ctrl+C gracefully
trap "kill $SERVER_PID; echo -e '\n${YELLOW}Stopping server...${RESET}'; exit" SIGINT

# Keep the process running
wait $SERVER_PID
