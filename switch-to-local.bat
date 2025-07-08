@echo off
echo ========================================
echo Переключение на ЛОКАЛЬНЫЙ режим...
echo ========================================
echo.

REM Создаем резервные копии
echo Создание резервных копий...
copy index.html index.html.backup >nul 2>&1
copy content.html content.html.backup >nul 2>&1

REM Переключаем index.html на auth-local.html
echo Обновление index.html...
powershell -Command "(Get-Content index.html) -replace 'auth.html', 'auth-local.html' | Set-Content index.html"

REM Переключаем content.html на js/auth-local.js
echo Обновление content.html...
powershell -Command "(Get-Content content.html) -replace 'js/auth.js', 'js/auth-local.js' | Set-Content content.html"

echo.
echo ✅ Переключено на локальный режим!
echo.
echo Теперь можно открыть index.html в браузере
echo или загрузить на GitHub Pages
echo.
pause
