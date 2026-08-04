@echo off
chcp 65001 >nul
set "PORT=5500"
set "FOUND="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
  set "FOUND=1"
  echo Dang dong PID %%P tren cong %PORT%...
  taskkill /F /PID %%P
)
if not defined FOUND echo Khong co tien trinh nao dang LISTEN tren cong %PORT%.
echo.
echo Da hoan tat.
pause
