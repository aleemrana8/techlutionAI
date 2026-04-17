@echo off
REM Wrapper script for npm to ensure Node.js is in the PATH
set PATH=C:\Program Files\nodejs;%PATH%
"%~dp0node_modules\.bin\npm.cmd" %*
