@echo off
echo ========================================
echo Переключение на СЕРВЕРНЫЙ режим...
echo ========================================
echo.

REM Создаем резервные копии
echo Создание резервных копий...
copy index.html index.html.backup >nul 2>&1
copy content.html content.html.backup >nul 2>&1

REM Переключаем index.html на auth.html
echo Обновление index.html...
powershell -Command "(Get-Content index.html) -replace 'auth-local.html', 'auth.html' | Set-Content index.html"

REM Переключаем content.html на js/auth.js
echo Обновление content.html...
powershell -Command "(Get-Content content.html) -replace 'js/auth-local.js', 'js/auth.js' | Set-Content content.html"

echo.
echo ✅ Переключено на серверный режим!
echo.
echo Теперь запустите сервер:
echo   npm install (если еще не установлены зависимости)
echo   npm start
echo.
pause
