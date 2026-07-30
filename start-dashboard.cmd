@echo off
title E Monitoring Kwara Dashboard
cd /d "%~dp0"
echo Starting E Monitoring Kwara Dashboard...
echo.
echo Keep this window open while using the dashboard.
echo Dashboard: http://127.0.0.1:5173
echo.
call npm.cmd run dev
pause
