@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PORT=5500"

echo Dang kiem tra cong %PORT%...
set "FOUND_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  set "FOUND_PID=%%P"
  echo Cong %PORT% dang duoc PID %%P su dung.
  taskkill /F /PID %%P >nul 2>&1
)

if defined FOUND_PID (
  echo Da dong tien trinh cu tren cong %PORT%.
  timeout /t 1 /nobreak >nul
)

start "" cmd /c "timeout /t 2 /nobreak ^>nul ^& start http://localhost:%PORT%/?v=2.3.1"
py -m http.server %PORT%
if errorlevel 1 (
  echo.
  echo Khong chay duoc bang lenh py. Dang thu python...
  python -m http.server %PORT%
)
pause
