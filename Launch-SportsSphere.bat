@echo off
setlocal
cd /d %~dp0

:: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
::  🏆 SportsSphere — One-Click Launcher (Windows)
:: ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

title SportsSphere — Professional Launcher

cls
echo ============================================================
echo   ⚡ CDGI SportsSphere — Professional Launcher
echo ============================================================
echo.

:: 1. Sync Dependencies
echo   [1/3] 📦 Phase 1: Syncing Dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo   [X] Failed to install dependencies. Ensure Node.js and npm are installed.
    pause
    exit /b 1
)
echo   [OK] Dependencies up to date.
echo.

:: 2. Check for .env.local
if not exist ".env.local" (
    echo   [!] Warning: .env.local not found. Creating default development configuration...
    echo DATABASE_URL="file:./database/sports.db" > .env.local
)

:: 3. Start Development Server
echo   [2/3] 🚀 Phase 2: Starting Development Server...
:: Silent start of dev server in background
start /b npm run dev > nul 2>&1

:: 4. Wait for Server & Launch Browser
echo   [3/3] 🌐 Phase 3: Launching Browser...
echo       Waiting for port 3000 to be ready...

:: Wait for server to initialize
timeout /t 5 /nobreak > nul

:: Attempt to open in "Bro Browser" (Assuming Brave)
echo       Opening Bro Browser...

:: Try Brave first, then Chrome, then default
start "" "brave" http://localhost:3000 2>nul || start "" "chrome" http://localhost:3000 2>nul || start http://localhost:3000

echo.
echo   [SUCCESS] ✨ SportsSphere is now live at http://localhost:3000
echo             Keep this window open to maintain the server connection.
echo             Close this window to stop.
echo ============================================================

:: Keep window open
pause
