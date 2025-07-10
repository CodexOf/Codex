@echo off
chcp 65001 >nul
echo 🎨 Восстановление анимаций переходов + работающие кнопки
echo.
echo ✅ Кнопки работают (исправлено ранее)
echo 🎨 Восстанавливаем красивые анимации затемнения
echo 🔄 Объединяем в одну систему
echo.

echo 📝 Добавление объединенной системы...
git add js/working-navigation-with-animations.js index.html

echo 💾 Коммит восстановления анимаций...
git commit -m "🎨 Восстановлены анимации переходов + работающие кнопки

ПРОБЛЕМА: После исправления кнопок пропали красивые анимации затемнения

РЕШЕНИЕ:
- Создан js/working-navigation-with-animations.js - объединенная система
- Сохранены работающие кнопки (клик событие + onclick)  
- Восстановлены красивые анимации затемнения при переходах
- Добавлен transition overlay с правильными стилями
- Анимации: fadeOutMainPageElements, fadeOutGenericElements  
- Эффекты: exit-text-animation, exit-background-animation
- Поддержка sessionStorage для плавных переходов
- Резервная система без анимаций на случай ошибок

РЕЗУЛЬТАТ: Работающие кнопки + Красивые анимации как раньше!"

echo 🌐 Отправка восстановления анимаций...
git push

if %ERRORLEVEL% EQU 0 (
    echo ✅ АНИМАЦИИ ВОССТАНОВЛЕНЫ!
    echo 🎨 Теперь кнопки работают И есть красивые переходы
    echo 🔄 Обновите: https://codexof.github.io/Codex/
    echo 🧪 Протестируйте: testAnimatedButtons()
    echo 💡 Если анимации глючат - нажмите Ctrl+Shift+R
) else (
    echo ❌ Ошибка отправки
)

pause
