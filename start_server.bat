@echo off
title Silent Monuments of Space - Local NASA Web Server
cd /d "%~dp0"
echo Starting local server at http://127.0.0.1:8000/index.html ...
python serve.py --port 8000
pause
