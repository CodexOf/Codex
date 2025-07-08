@echo off
echo ========================================
echo       CODEX SERVER LAUNCHER
echo ========================================
echo.

REM Проверяем, установлен ли Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не установлен!
    echo Скачайте и установите Node.js с https://nodejs.org
    pause
    exit /b 1
)

echo [INFO] Node.js найден
node --version

REM Проверяем наличие package.json
if not exist package.json (
    echo [ОШИБКА] Файл package.json не найден!
    echo Убедитесь, что вы находитесь в правильной папке проекта
    pause
    exit /b 1
)

echo [INFO] Проверяем зависимости...

REM Проверяем, установлены ли зависимости
if not exist node_modules (
    echo [INFO] Устанавливаем зависимости...
    npm install
    if %errorlevel% neq 0 (
        echo [ОШИБКА] Не удалось установить зависимости!
        pause
        exit /b 1
    )
) else (
    echo [INFO] Зависимости уже установлены
)

echo.
echo [INFO] Создаем папку для данных...
if not exist data mkdir data

echo.
echo ========================================
echo      ЗАПУСК СЕРВЕРА CODEX
echo ========================================
echo.
echo Сервер будет доступен по адресу:
echo http://localhost:3000
echo.
echo Для остановки сервера нажмите Ctrl+C
echo.

REM Запускаем сервер
npm start
