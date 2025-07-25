# Исправление перенаправления после авторизации

## Проблема

После регистрации или входа в систему пользователь всегда перенаправлялся на `content.html`, даже если он изначально пытался попасть на страницу календаря (`calendar.html`).

## Решение

Реализована система отслеживания источника перехода с помощью URL-параметра `returnTo`.

### Как это работает

1. **При переходе на календарь без авторизации:**
   - `calendar.html` → `auth-local.html?returnTo=calendar`

2. **После успешной авторизации/регистрации:**
   - Если `returnTo=calendar` → перенаправление на `calendar.html`
   - Иначе → перенаправление на `content.html` (по умолчанию)

### Измененные файлы

#### `js/calendar.js`
- Строка 7: `window.location.href = 'auth-local.html?returnTo=calendar';`
- Строка 38: `window.location.href = 'auth-local.html?returnTo=calendar';`

#### `auth-local.html`
- **Форма входа:** Добавлена проверка `returnTo` параметра
- **Форма регистрации:** Добавлена проверка `returnTo` параметра

#### `auth.html` (серверная версия)
- **Форма входа:** Добавлена проверка `returnTo` параметра  
- **Форма регистрации:** Добавлена проверка `returnTo` параметра

### Логика перенаправления

```javascript
// Проверяем, откуда пришел пользователь
const urlParams = new URLSearchParams(window.location.search);
const returnTo = urlParams.get('returnTo');

if (returnTo === 'calendar') {
    window.location.href = 'calendar.html';
} else {
    window.location.href = 'content.html';
}
```

## Результат

✅ **Теперь пользователь корректно возвращается туда, откуда пришел:**

- `index.html` → кнопка "Календарь" → `calendar.html` 
- Если не авторизован → `auth-local.html?returnTo=calendar`
- После авторизации/регистрации → **возврат на `calendar.html`** ✅

- `index.html` → кнопка "Начать приключение" → `content.html`
- Если не авторизован → `auth-local.html` (без returnTo)
- После авторизации/регистрации → **возврат на `content.html`** ✅

## Совместимость

- ✅ Работает с локальной системой авторизации (`auth-local.html`)
- ✅ Работает с серверной системой авторизации (`auth.html`)  
- ✅ Обратная совместимость сохранена (без `returnTo` ведет на `content.html`)
- ✅ Не влияет на существующую функциональность

## Тестирование

Для проверки исправления:

1. Открыть `index.html`
2. Нажать "Календарь" 
3. **Если не авторизован:** перейти на авторизацию и зарегистрироваться/войти
4. **Ожидаемый результат:** попадание на страницу календаря, а не на content.html

✅ **Проблема решена!**
