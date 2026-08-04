@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"

set "REPO_NAME=%~1"
if "%REPO_NAME%"=="" set "REPO_NAME=rirekisho-a3-app"

echo === KIEM TRA GITHUB CLI ===
where gh >nul 2>nul
if errorlevel 1 (
  echo Chua cai GitHub CLI. Hay cai gh va chay: gh auth login
  pause
  exit /b 1
)

gh auth status
if errorlevel 1 (
  echo Hay dang nhap GitHub truoc bang: gh auth login
  pause
  exit /b 1
)

if not exist .git (
  git init
  git branch -M main
)

git add .
git diff --cached --quiet
if errorlevel 1 git commit -m "Khoi tao ung dung tao rirekisho A3"

for /f "delims=" %%U in ('gh api user --jq .login') do set "GH_USER=%%U"

git remote get-url origin >nul 2>nul
if errorlevel 1 (
  echo === TAO REPOSITORY %REPO_NAME% ===
  gh repo create "%REPO_NAME%" --public --source=. --remote=origin --push --description "Ung dung tao so yeu ly lich Nhat Ban A3 - PWA, chinh anh, xuat va chia se PDF"
  if errorlevel 1 goto :error
) else (
  git push -u origin main
  if errorlevel 1 goto :error
)

echo.
echo === BAT GITHUB PAGES BANG ACTIONS ===
gh api -X POST "repos/%GH_USER%/%REPO_NAME%/pages" -f build_type=workflow >nul 2>nul

echo.
echo Hoan tat upload GitHub.
echo Repository: https://github.com/%GH_USER%/%REPO_NAME%
echo GitHub Pages se co tai: https://%GH_USER%.github.io/%REPO_NAME%/
echo Kiem tra tien do: gh run list --limit 5
pause
exit /b 0

:error
echo.
echo Upload that bai. Hay doc thong bao loi o tren.
pause
exit /b 1
