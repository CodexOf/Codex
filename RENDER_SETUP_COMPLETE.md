# Использование серверной версии с Render

## Текущая конфигурация:

✅ **Сервер развернут на Render**: https://codex-of.onrender.com  
✅ **CORS настроен** для работы с GitHub Pages  
✅ **URL обновлен** в js/auth.js  

## Как использовать:

### Вариант 1: С GitHub Pages + Render (рекомендуется)

1. **Переключитесь на серверную версию локально**:
   ```bash
   switch-to-server.bat
   ```

2. **Закоммитьте изменения**:
   ```bash
   git add .
   git commit -m "Настройка для работы с Render сервером"
   git push
   ```

3. **Используйте серверную версию**:
   ```
   https://[ваш-username].github.io/Codex/
   ```
   
   Теперь при нажатии "Начать приключение" вас направит на `auth.html`, который будет работать с сервером Render.

### Вариант 2: Только локальная версия (без сервера)

Если сервер Render недоступен, переключитесь обратно:
```bash
switch-to-local.bat
git add .
git commit -m "Переключение на локальную версию"
git push
```

## Тестирование:

1. Откройте https://[ваш-username].github.io/Codex/
2. Нажмите "Начать приключение"
3. Попробуйте зарегистрироваться
4. Проверьте консоль браузера (F12)

### Что должно произойти:
- Запросы идут на https://codex-of.onrender.com/api/...
- Данные сохраняются на сервере
- Можно войти с любого устройства

## Важные моменты:

### Бесплатный план Render:
- 🔄 Сервер "засыпает" после 15 минут неактивности
- ⏱️ Первый запрос может занять 30-50 секунд (сервер "просыпается")
- 💾 Данные сохраняются между перезапусками

### Если появляются ошибки CORS:
1. Проверьте, что сервер запущен (откройте https://codex-of.onrender.com)
2. Посмотрите логи в Render Dashboard
3. Убедитесь, что используете правильные файлы (auth.html, а не auth-local.html)

## Структура:

```
GitHub Pages (Frontend)              Render (Backend API)
├── index.html                       ├── server.js
├── auth.html          <-- API -->   ├── /api/register
├── content.html                     ├── /api/login
└── js/auth.js                       └── /api/events
```

## Команды для быстрого переключения:

```bash
# Для серверной версии (GitHub Pages + Render)
switch-to-server.bat

# Для локальной версии (только GitHub Pages)
switch-to-local.bat
```

## Мониторинг:

- **Логи сервера**: https://dashboard.render.com → ваш сервис → Logs
- **Статус сервера**: https://codex-of.onrender.com (должен показать страницу)
- **API тест**: https://codex-of.onrender.com/api/user (должен вернуть ошибку авторизации)
