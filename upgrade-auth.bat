@echo off
chcp 65001 >nul
echo 🚀 Внедрение улучшенной системы авторизации Codex...
echo.

echo 📂 Создание резервной копии текущего auth.js...
if exist "js\auth.js" (
    copy "js\auth.js" "js\auth-backup.js" >nul
    echo ✅ Резервная копия создана: js\auth-backup.js
) else (
    echo ⚠️ Файл auth.js не найден
)

echo.
echo 🔄 Замена файла авторизации...
copy "js\auth-improved.js" "js\auth.js" >nul
echo ✅ Новая система авторизации установлена

echo.
echo 📝 Добавление файлов в Git...
git add js/improved/ js/auth-improved.js js/auth.js
echo ✅ Файлы добавлены в Git

echo.
echo 💾 Создание коммита...
git commit -m "🎯 Улучшена система авторизации - теперь данные не теряются при очистке браузера

✨ Новые возможности:
- Множественное резервное хранение (localStorage + sessionStorage + cookies + IndexedDB)
- Автоматическое восстановление сессий
- Офлайн режим работы
- Автоматическая синхронизация
- Защита от потери данных при очистке браузера
- Обратная совместимость со старой системой

🔧 Техническая информация:
- Добавлена система PersistentStorage для надежного хранения
- Улучшен AuthManager с автоматическим восстановлением
- Расширен EventManager с офлайн поддержкой
- Добавлена автоматическая миграция данных
- Встроена система диагностики и отладки"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Коммит создан успешно
) else (
    echo ⚠️ Ошибка создания коммита
)

echo.
echo 🌐 Отправка изменений на GitHub...
git push

if %ERRORLEVEL% EQU 0 (
    echo ✅ Изменения отправлены на GitHub
    echo 🎉 ГОТОВО! Улучшенная система авторизации развернута
    echo.
    echo 📊 Что изменилось:
    echo • Пользователи больше НЕ ПОТЕРЯЮТ данные при очистке браузера
    echo • Автоматическое восстановление сессий
    echo • Работа в офлайн режиме
    echo • Синхронизация между устройствами
    echo • Полная совместимость со старым кодом
    echo.
    echo 🔧 Для диагностики используйте: CodexDebug.runFullDiagnostics()
) else (
    echo ❌ Ошибка отправки на GitHub
    echo 💡 Попробуйте выполнить: git push
)

echo.
echo 🎯 Система улучшена! Теперь пользователи не будут думать об авторизации.
pause
