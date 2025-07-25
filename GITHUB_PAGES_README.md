# Codex на GitHub Pages

## Важно!

GitHub Pages поддерживает только статические сайты, поэтому **серверная версия здесь работать не будет**.

Для GitHub Pages используется **локальная версия** системы авторизации, которая сохраняет все данные в браузере (localStorage).

## Как это работает:

### ✅ Что работает на GitHub Pages:
- Регистрация и вход пользователей
- Управление событиями в календаре
- Система ролей (админ, модератор, пользователь)
- Все функции сайта

### 📦 Где хранятся данные:
- **В браузере пользователя** (localStorage)
- Данные сохраняются между сессиями
- Каждый браузер имеет свои данные

### ⚠️ Ограничения:
- Данные доступны только в том браузере, где вы зарегистрировались
- При очистке данных браузера информация будет потеряна
- Нельзя войти с другого устройства с теми же данными

## Безопасность:

Несмотря на локальное хранение, система обеспечивает:
- ✅ Хеширование паролей
- ✅ Проверку уникальности пользователей
- ✅ Систему ролей и прав доступа
- ✅ Защиту от базовых атак

## Для пользователей:

### Первый вход:
1. Нажмите "Регистрация"
2. Создайте аккаунт
3. Запомните данные - они сохранятся только в этом браузере

### Рекомендации:
- Используйте один браузер для работы с системой
- Не очищайте данные браузера
- Делайте резервные копии важной информации

## Для разработчиков:

### Переключение на серверную версию:
Если вы хотите запустить полноценную серверную версию локально:

1. Клонируйте репозиторий
2. Установите Node.js
3. Выполните `npm install`
4. Следуйте инструкциям в `SERVER_MODE_README.md`

### Структура проекта для GitHub Pages:
```
auth-local.html     - страница входа
content.html        - основной контент
js/auth-local.js    - логика авторизации
index.html          - главная страница
```

## Альтернативные решения:

Если нужна серверная функциональность на GitHub Pages, можно использовать:
- Firebase (бесплатный план)
- Supabase (бесплатный план)
- Netlify Functions
- Vercel Functions

Но это потребует дополнительной настройки и изменения кода.

## Заключение:

Текущая версия полностью функциональна для GitHub Pages. Все данные сохраняются в браузере пользователя, что обеспечивает работу без сервера, но с некоторыми ограничениями по синхронизации между устройствами.
