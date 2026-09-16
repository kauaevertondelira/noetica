@echo off
setlocal
cd /d "%~dp0"
title Noetica - servidor local

where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo Nao foi possivel encontrar o Windows PowerShell.
  echo Consulte o README.md para instalar o Node.js e iniciar o projeto.
  pause
  exit /b 1
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0INICIAR.ps1"
if errorlevel 1 (
  echo.
  echo A Noetica nao conseguiu iniciar. Leia a mensagem acima.
  pause
)

