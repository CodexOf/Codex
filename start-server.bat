@echo off
title Codex Server Setup
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║           CODEX SERVER               ║
echo  ║        Setup and Launch              ║
echo  ╚══════════════════════════════════════╝
echo.

REM Проверяем, запущен ли сервер
netstat -an | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Порт 3000 уже используется!
    echo Возможно, сервер уже запущен.
    echo.
    choice /c YN /m "Открыть браузер"
    if %errorlevel% equ 1 (
        start http://localhost:3000
    )
    pause
    exit /b 0
)

REM Проверяем Node.js
echo [1/5] Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js не установлен!
    echo.
    echo Установите Node.js с https://nodejs.org
    echo Рекомендуется версия LTS (Long Term Support)
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js установлен
node --version

REM Проверяем npm
echo [2/5] Проверка npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm не найден!
    pause
    exit /b 1
)

echo [OK] npm доступен
npm --version

REM Проверяем package.json
echo [3/5] Проверка проекта...
if not exist package.json (
    echo [ERROR] Файл package.json не найден!
    echo Убедитесь, что вы находитесь в папке D:\Git_Projects\Codex
    echo.
    pause
    exit /b 1
)

echo [OK] Проект найден

REM Устанавливаем зависимости
echo [4/5] Установка зависимостей...
if not exist node_modules (
    echo Устанавливаем зависимости...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Ошибка установки зависимостей!
        pause
        exit /b 1
    )
) else (
    echo [OK] Зависимости уже установлены
)

REM Создаем папку data
echo [5/5] Подготовка к запуску...
if not exist data mkdir data
echo [OK] Папка данных готова

echo.
echo  ╔══════════════════════════════════════╗
echo  ║          ЗАПУСК СЕРВЕРА              ║
echo  ╚══════════════════════════════════════╝
echo.
echo Сервер будет доступен по адресу:
echo  ➤ http://localhost:3000
echo.
echo Автоматически откроется браузер через 3 секунды...
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.

REM Открываем браузер через 3 секунды
start /min timeout /t 3 /nobreak >nul 2>&1 && start http://localhost:3000

REM Запускаем сервер
echo Запуск сервера...
npm start
