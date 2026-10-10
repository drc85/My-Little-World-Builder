@echo off
setlocal
cd /d "%~dp0"
if /i "%~1"=="--server" goto server
start "My Little World Builder Server" /min "%ComSpec%" /c ""%~f0" --server"
exit /b
:server
title My Little World Builder Server
where py >nul 2>nul
if not errorlevel 1 (
  py -3 -X utf8 "assets\tool.py"
  goto done
)
where python >nul 2>nul
if not errorlevel 1 (
  python -X utf8 "assets\tool.py"
  goto done
)
echo Python 3 was not found. Please install Python.
pause
exit /b 1
:done
if errorlevel 1 pause
endlocal
