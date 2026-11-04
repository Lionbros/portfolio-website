@echo off
cd /d "%~dp0"
echo Server accessible on your network at: http://192.168.1.164:8000
echo Press Ctrl+C to stop.
start http://192.168.1.164:8000/v2/
python -m http.server 8000 --bind 0.0.0.0
pause
