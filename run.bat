@echo off
cd /d "%~dp0"
title DATASPHERE 26 Server
echo Starting DATASPHERE 26 Server...
echo.
echo Open your browser at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
echo.
node server.js
pause
