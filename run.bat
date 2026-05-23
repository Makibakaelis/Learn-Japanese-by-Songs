@echo off
:: Di chuyển lệnh vào đúng thư mục chứa file này
cd /d "%~dp0"

:: Đổi tên cửa sổ dòng lệnh cho đẹp
title J-Pop Music Player Server

echo ===================================================
echo   DANG KHOI DONG TRINH PHAT NHAC J-POP...
echo ===================================================
echo.

:: Tự động mở trình duyệt mặc định và truy cập vào App
start "" "http://localhost:5000"

:: Chạy server Node.js
node server.js

pause