@echo off
title Burning Activity Explorer - TEAM STERION
echo ========================================================
echo   BURNING ACTIVITY EXPLORER - NASA Space Apps 2026
echo   Developed by TEAM STERION
echo ========================================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this PC!
    echo.
    echo Please install Node.js (v18 or v20 LTS) from:
    echo https://nodejs.org/
    echo.
    echo After installing Node.js, run this file again.
    pause
    exit /b 1
)

:: Install dependencies if node_modules does not exist
if not exist "node_modules\" (
    echo [SETUP] Installing required libraries...
    echo (This only happens on the first run, takes about 15 seconds)
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Installation failed. Please check your internet connection.
        pause
        exit /b 1
    )
)

echo.
echo [LAUNCH] Starting local server...
echo The app will open in your browser automatically at:
echo http://localhost:5173
echo.
echo (Keep this window open while using the app. Press Ctrl+C to stop)
echo ========================================================
echo.

:: Open browser after 2 seconds
start "" http://localhost:5173

:: Start dev server
call npm run dev
pause
