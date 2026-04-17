@echo off
REM Set up Node.js in PATH and start development server
set PATH=C:\Program Files\nodejs;%PATH%
cd /d "%~dp0"
node node_modules\.bin\vite
