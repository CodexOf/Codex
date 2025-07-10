// ЕДИНСТВЕННЫЙ РАБОЧИЙ ФАЙЛ НАВИГАЦИИ - убираем все конфликты
console.log('🎯 Загрузка ЕДИНСТВЕННОГО файла навигации...');

// Останавливаем все другие скрипты навигации
window.NAVIGATION_LOADED = true;

// Простая функция перехода
function goTo(url) {
    console.log('🌐 Переход на:', url);
    try {
        window.location.href = url;
    } catch (error) {
        console.error('Ошибка перехода:', error);
        window.location = url;
    }
}

// Простая проверка авторизации
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    return !!(token && user);
}

// Функция настройки кнопок
function setupButtons() {
    console.log('🔧 Настройка кнопок...');
    
    // Убираем ВСЕ старые обработчики событий
    const allButtons = document.querySelectorAll('a, button');
    allButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        if (btn.parentNode) {
            btn.parentNode.replaceChild(newBtn, btn);
        }
    });
    
    // Кнопка "Начать приключение"
    const startBtn = document.querySelector('.start-button:not(.calendar-button)');
    if (startBtn) {
        console.log('🚀 Настройка кнопки "Начать приключение"');
        startBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚀 Клик: Начать приключение');
            goTo('content.html?from=index');
            return false;
        };
        
        // Дополнительные обработчики
        startBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🚀 Event: Начать приключение');
            goTo('content.html?from=index');
        }, true);
        
        console.log('✅ Кнопка "Начать приключение" настроена');
    }
    
    // Кнопка "Календарь"
    const calendarBtn = document.querySelector('.calendar-button');
    if (calendarBtn) {
        console.log('📅 Настройка кнопки календаря');
        calendarBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📅 Клик: Календарь');
            
            if (isAuthenticated()) {
                goTo('calendar.html');
            } else {
                goTo('auth.html?returnTo=calendar');
            }
            return false;
        };
        
        // Дополнительные обработчики
        calendarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📅 Event: Календарь');
            
            if (isAuthenticated()) {
                goTo('calendar.html');
            } else {
                goTo('auth.html?returnTo=calendar');
            }
        }, true);
        
        console.log('✅ Кнопка календаря настроена');
    }
    
    // Виджет календаря
    const widget = document.getElementById('calendarWidget');
    if (widget) {
        console.log('📅 Настройка виджета календаря');
        widget.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📅 Клик: Виджет календаря');
            
            if (isAuthenticated()) {
                goTo('calendar.html');
            } else {
                goTo('auth.html?returnTo=calendar');
            }
            return false;
        };
        
        console.log('✅ Виджет календаря настроен');
    }
    
    console.log('🎉 Все кнопки настроены!');
}

// Запуск при готовности DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupButtons);
} else {
    setupButtons();
}

// Дополнительные запуски для надежности
setTimeout(setupButtons, 100);
setTimeout(setupButtons, 500);
setTimeout(setupButtons, 1000);

// Глобальная функция для отладки
window.testButtons = function() {
    console.log('=== ТЕСТ КНОПОК ===');
    
    const startBtn = document.querySelector('.start-button:not(.calendar-button)');
    const calendarBtn = document.querySelector('.calendar-button');
    
    console.log('Кнопка "Начать приключение":', startBtn);
    console.log('Кнопка календаря:', calendarBtn);
    console.log('Авторизован:', isAuthenticated());
    
    if (startBtn) {
        console.log('🧪 Тестируем кнопку "Начать приключение"...');
        startBtn.click();
    }
};

// Блокируем другие скрипты навигации
window.UniversalPageTransitions = {
    init: function() { console.log('🚫 UniversalPageTransitions заблокирован'); },
    performTransition: function(url) { 
        console.log('🚫 UniversalPageTransitions заблокирован, используем простой переход');
        goTo(url);
    },
    isTransitioning: false
};

console.log('🎯 ЕДИНСТВЕННЫЙ файл навигации загружен');
console.log('🧪 Для тестирования: testButtons()');
