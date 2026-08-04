@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

if not exist .git (
  echo Thu muc nay chua duoc khoi tao Git. Hay chay PUBLISH_TO_GITHUB.bat truoc.
  pause
  exit /b 1
)

set "MSG=%~1"
if "%MSG%"=="" set "MSG=Cap nhat ung dung rirekisho A3"

git add .
git diff --cached --quiet
if not errorlevel 1 (
  echo Khong co thay doi moi de upload.
  pause
  exit /b 0
)

git commit -m "%MSG%"
git pull --rebase origin main
if errorlevel 1 (
  echo Git pull bi loi. Hay xu ly conflict truoc khi push.
  pause
  exit /b 1
)
git push origin main
if errorlevel 1 (
  echo Push that bai.
  pause
  exit /b 1
)

echo Da cap nhat GitHub va GitHub Pages se tu deploy lai.
pause
