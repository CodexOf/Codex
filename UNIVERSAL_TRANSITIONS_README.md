# Универсальная система анимаций переходов

## Обзор

Универсальная система анимаций переходов обеспечивает плавные анимированные переходы между всеми страницами сайта Codex of Heroes. Система автоматически обнаруживает ссылки и применяет анимацию затемнения при переходах.

## Компоненты

### 1. CSS файл (`css/utilities/page-transitions.css`)
- Определяет стили для анимаций
- Создает оверлей для переходов
- Настраивает keyframes для анимаций

### 2. JavaScript файл (`js/universal-transitions.js`)
- Основная логика системы переходов
- Автоматическое обнаружение элементов навигации
- Управление состояниями анимаций

### 3. Тестовая страница (`universal-transitions-test.html`)
- Инструменты для тестирования переходов
- Отладочная информация
- Навигация по всем страницам

## Как работает система

### 1. Инициализация
```javascript
UniversalPageTransitions.init()
```
- Создает оверлей для переходов
- Настраивает обработчики событий
- Обрабатывает появление страницы

### 2. Типы переходов

#### Главная страница (index.html)
- Затемнение: заголовок, подзаголовок, кнопки, футер
- Специальная обработка кнопки календаря
- Анимация фона

#### Страница контента (content.html)
- Виджет календаря
- Кнопки навигации
- Затемнение сайдбара и контента

#### Страница календаря (calendar.html)
- Кнопка возврата к контенту
- Виджет контента
- Кнопка выхода
- Затемнение элементов календаря

#### Страницы авторизации
- Автоматическое перенаправление после авторизации
- Интеграция с системой аутентификации

### 3. Фазы анимации

1. **Затемнение элементов** (0-300ms)
   - Применение класса `exit-text-animation`
   - Плавное исчезновение текста и элементов

2. **Появление оверлея** (300-800ms)
   - Активация черного оверлея
   - Покрытие всего экрана

3. **Затемнение фона** (500-1000ms)
   - Применение класса `exit-background-animation`
   - Анимация масштабирования фона

4. **Переход на новую страницу** (1200ms)
   - Сохранение состояния в sessionStorage
   - Навигация на новую страницу

5. **Появление новой страницы** (0-500ms)
   - Проверка состояния перехода
   - Плавное исчезновение оверлея
   - Восстановление интерактивности

## Настройка для новых страниц

### 1. Подключение CSS
```html
<link rel="stylesheet" href="css/utilities/page-transitions.css">
```

### 2. Подключение JavaScript
```html
<script src="js/universal-transitions.js"></script>
```

### 3. Автоматическое обнаружение
Система автоматически обнаруживает:
- Ссылки с классом `.start-button`
- Элементы с ID `calendarWidget` и `contentWidget`
- Ссылки с классом `.back-btn`
- Кнопки с ID `logoutBtn`

### 4. Ручная настройка
```javascript
// Добавить обработчик для кастомного элемента
document.getElementById('myButton').addEventListener('click', (e) => {
    e.preventDefault();
    UniversalPageTransitions.performTransition('target-page.html', 'custom-type');
});
```

## API

### Основные методы

#### `UniversalPageTransitions.init()`
Инициализирует систему переходов

#### `UniversalPageTransitions.performTransition(targetUrl, transitionType)`
Выполняет анимированный переход
- `targetUrl` - URL целевой страницы
- `transitionType` - тип анимации ('main-page', 'calendar-page', 'back-to-content', etc.)

#### `UniversalPageTransitions.reset()`
Сбрасывает состояние системы

#### `UniversalPageTransitions.getStatus()`
Возвращает информацию о состоянии системы

#### `UniversalPageTransitions.debug()`
Выводит отладочную информацию в консоль

### Состояния

#### `isTransitioning`
Булево значение, указывающее на активный переход

#### `overlay`
DOM элемент оверлея для переходов

#### `transitionDuration`
Длительность анимации в миллисекундах (по умолчанию: 1200ms)

## Отладка

### 1. Тестовая страница
Откройте `universal-transitions-test.html` для:
- Тестирования переходов между страницами
- Просмотра состояния системы
- Отладки обработчиков событий

### 2. Консольные команды
```javascript
// Проверить статус системы
UniversalPageTransitions.getStatus()

// Показать отладочную информацию
UniversalPageTransitions.debug()

// Сбросить состояние
UniversalPageTransitions.reset()

// Протестировать переход
UniversalPageTransitions.performTransition('index.html', 'test')
```

### 3. Сессионное хранилище
Система использует `sessionStorage.getItem('pageTransition')` для:
- Определения переходов между страницами
- Правильного воспроизведения анимации появления

## Типы анимаций

### Затемнение текста (textFadeOut)
- Исчезновение с движением вверх
- Длительность: 0.5s
- Применяется к текстовым элементам

### Затемнение фона (backgroundFadeOut)
- Исчезновение с увеличением масштаба
- Длительность: 0.8s
- Применяется к контейнерам

### Появление страницы (pageEntrance)
- Плавное появление от прозрачности
- Длительность: 1s
- Задержка: 0.3s

## Совместимость

### Поддерживаемые браузеры
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Отключение анимаций
Система уважает настройку `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
    .page-transition-overlay {
        transition-duration: 0.01ms !important;
    }
}
```

## Производительность

### Оптимизации
- Использование CSS transform3d для аппаратного ускорения
- Минимальное количество DOM манипуляций
- Предварительное создание оверлея
- Очистка event listeners при переходах

### Мониторинг
```javascript
// Проверить время выполнения перехода
console.time('transition');
UniversalPageTransitions.performTransition('page.html', 'test');
// В новой странице:
console.timeEnd('transition');
```

## Устранение неполадок

### Анимация не запускается
1. Проверьте подключение CSS и JS файлов
2. Убедитесь в корректности селекторов
3. Проверьте консоль на ошибки JavaScript

### Оверлей не исчезает
1. Вызовите `UniversalPageTransitions.reset()`
2. Проверьте состояние в sessionStorage
3. Перезагрузите страницу

### Элементы не обнаруживаются
1. Проверьте ID и классы элементов
2. Убедитесь в загрузке DOM
3. Используйте `UniversalPageTransitions.getStatus()` для диагностики

## Расширение системы

### Добавление новых типов переходов
```javascript
// В fadeOutPageElements()
case 'my-custom-type':
    this.fadeOutMyCustomElements();
    break;

// Новый метод
static fadeOutMyCustomElements() {
    const elements = ['.my-element', '.my-other-element'];
    elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('exit-text-animation');
        }
    });
}
```

### Кастомные анимации
```css
@keyframes myCustomAnimation {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.8) rotate(5deg); }
}

.my-custom-exit {
    animation: myCustomAnimation 0.6s ease-out forwards;
}
```

## Changelog

### v1.0.0 (2025-01-10)
- Первая версия универсальной системы переходов
- Поддержка всех основных страниц сайта
- Автоматическое обнаружение элементов навигации
- Интеграция с системой авторизации
- Тестовая страница и отладочные инструменты
