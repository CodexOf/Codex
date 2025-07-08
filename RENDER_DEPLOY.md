# Развертывание Codex на Render.com

## Шаг 1: Подготовка к деплою

### Переключитесь на серверную версию:
```bash
switch-to-server.bat
```

### Загрузите изменения на GitHub:
```bash
git add .
git commit -m "Подготовка к деплою на Render"
git push
```

## Шаг 2: Создание Web Service на Render

1. Зайдите на https://render.com и зарегистрируйтесь/войдите

2. Нажмите **"New +"** → **"Web Service"**

3. Подключите GitHub репозиторий:
   - Нажмите "Connect GitHub"
   - Выберите ваш репозиторий Codex
   - Нажмите "Connect"

4. Настройте сервис:
   ```
   Name: codex-server (или любое другое)
   Region: Frankfurt (EU) или Oregon (US)
   Branch: main
   Root Directory: (оставьте пустым)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. Нажмите **"Create Web Service"**

## Шаг 3: После деплоя

1. Render даст вам URL вида: `https://codex-server-XXXX.onrender.com`

2. Обновите `js/auth.js`:
   ```javascript
   // Найдите строку:
   return 'https://codex-XXXX.onrender.com';
   
   // Замените на ваш URL:
   return 'https://codex-server-abcd.onrender.com';
   ```

3. Закоммитьте изменения:
   ```bash
   git add js/auth.js
   git commit -m "Обновлен URL сервера Render"
   git push
   ```

## Шаг 4: Настройка CORS

Если появятся ошибки CORS, обновите `server.js`:

```javascript
// Добавьте ваш GitHub Pages URL
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5000',
        'https://ваш-username.github.io'
    ],
    credentials: true
};

app.use(cors(corsOptions));
```

## Структура после деплоя:

### Frontend (GitHub Pages):
- URL: `https://username.github.io/Codex`
- Файлы: HTML, CSS, JS
- Использует: `auth.html` и `js/auth.js`

### Backend (Render):
- URL: `https://codex-server-XXXX.onrender.com`
- Файлы: `server.js`, `package.json`
- API endpoints: `/api/login`, `/api/register`, etc.

## Важные моменты:

### Бесплатный план Render:
- ⏱️ Сервер "засыпает" после 15 минут неактивности
- 🔄 Первый запрос может занять 30-50 секунд
- 💾 Данные сохраняются в файлах (не потеряются)
- 🌐 750 часов бесплатно в месяц

### Альтернативы хранения данных:
Для production рекомендуется использовать базу данных:
- PostgreSQL (Render предоставляет бесплатно)
- MongoDB Atlas (бесплатный план)
- Supabase (бесплатный план)

## Тестирование:

1. Откройте `https://username.github.io/Codex`
2. Попробуйте зарегистрироваться
3. Проверьте консоль браузера (F12)
4. Проверьте логи на Render Dashboard

## Переключение обратно на локальный режим:

Если нужно вернуться к localStorage:
```bash
switch-to-local.bat
git add .
git commit -m "Переключение на локальный режим"
git push
```

## Полезные команды Render CLI:

```bash
# Установка Render CLI (опционально)
npm install -g @renderinc/cli

# Просмотр логов
render logs --service codex-server --tail

# Перезапуск сервиса
render services restart codex-server
```

## Troubleshooting:

### "Failed to load resource: net::ERR_FAILED"
- Проверьте URL сервера в `js/auth.js`
- Убедитесь, что сервер запущен на Render

### "CORS policy" ошибки
- Обновите CORS настройки в `server.js`
- Добавьте ваш GitHub Pages URL

### "Application failed to respond"
- Проверьте логи на Render
- Убедитесь, что `PORT` используется из переменной окружения

### Сервер долго запускается
- Это нормально для бесплатного плана
- Первый запрос "будит" сервер
