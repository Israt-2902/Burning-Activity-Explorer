#!/bin/bash
echo "========================================================"
echo "  BURNING ACTIVITY EXPLORER - NASA Space Apps 2026"
echo "  Developed by TEAM STERION"
echo "========================================================"
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed on this computer!"
    echo "Please download and install Node.js from: https://nodejs.org/"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[SETUP] Installing dependencies (first run only)..."
    npm install
fi

echo ""
echo "[LAUNCH] Starting Burning Activity Explorer..."
echo "Opening in browser at http://localhost:5173"
echo "(Press Ctrl+C in this terminal to stop the server)"
echo "========================================================"
echo ""

if command -v open &> /dev/null; then
    (sleep 2 && open http://localhost:5173) &
elif command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open http://localhost:5173) &
fi

npm run dev
