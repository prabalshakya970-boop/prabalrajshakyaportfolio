@echo off
set "PROJECT=C:\Users\ASUS\Documents\Codex\2026-06-19\re\work\prabal-portfolio-code"
set "PATH=C:\Users\ASUS\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\ASUS\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin;%PATH%"

if not exist "%PROJECT%\package.json" (
  echo Could not find the portfolio project folder:
  echo %PROJECT%
  pause
  exit /b 1
)

cd /d "%PROJECT%"
echo Starting the portfolio site...
echo.
echo Wait until this window says VITE ready, then open:
echo http://localhost:8080
echo.
echo Keep this window open while viewing the site.
echo.
start "" /b powershell.exe -NoProfile -Command "Start-Sleep -Seconds 8; Start-Process 'http://localhost:8080'"
"C:\Users\ASUS\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd" run dev
pause
