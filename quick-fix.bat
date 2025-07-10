@echo off
chcp 65001 >nul
echo 🔧 ПРОСТОЕ исправление навигации...
echo.

echo 📝 Добавление файлов...
git add js/simple-navigation-fix.js index.html

echo 💾 Коммит простого исправления...
git commit -m "🔧 ПРОСТОЕ исправление навигации - кнопки должны работать

- Добавлено js/simple-navigation-fix.js - базовое исправление без зависимостей
- Обновлен index.html для подключения исправления
- Кнопки работают через простой window.location.href
- Простая проверка авторизации через localStorage"

echo 🌐 Отправка...
git push

if %ERRORLEVEL% EQU 0 (
    echo ✅ ГОТОВО! Простое исправление применено.
    echo 🧪 Теперь откройте сайт и проверьте кнопки.
    echo 💡 Если не работает, откройте F12 → Console и напишите: testNavigation()
) else (
    echo ❌ Ошибка отправки
)

pause
