@echo off
cd /d "%~dp0"
echo Menjalankan ZIMO: Microbe Defense dengan Vite...
start "ZIMO Vite" /min cmd /c npm run dev -- --host 127.0.0.1
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173"
echo Server aktif di http://localhost:5173
echo Tutup proses "ZIMO Vite" untuk menghentikan server.
timeout /t 3 /nobreak >nul
