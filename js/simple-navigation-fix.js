// Простое исправление навигации - работает всегда
console.log('🔧 Загрузка простого исправления навигации...');

// Функция для безопасного перехода
function safeNavigate(url) {
    try {
        console.log('🌐 Переход на:', url);
        window.location.href = url;
    } catch (error) {
        console.error('❌ Ошибка перехода:', error);
        // Принудительный переход
        window.location = url;
    }
}

// Ждем загрузки DOM
function setupSimpleNavigation() {
    console.log('🔗 Настройка простой навигации...');
    
    // Находим кнопку "Начать приключение"
    const startButtons = document.querySelectorAll('.start-button:not(.calendar-button), a[href*="content.html"]');
    console.log('🚀 Найдено кнопок "Начать приключение":', startButtons.length);
    
    startButtons.forEach((button, index) => {
        // Убираем все старые обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`🚀 Клик по кнопке "Начать приключение" #${index + 1}`);
            safeNavigate('content.html?from=index');
        });
        
        console.log(`✅ Обработчик добавлен к кнопке #${index + 1}`);
    });
    
    // Находим кнопку "Календарь"
    const calendarButtons = document.querySelectorAll('.calendar-button, .start-button.calendar-button, a[href*="calendar.html"]');
    console.log('📅 Найдено кнопок календаря:', calendarButtons.length);
    
    calendarButtons.forEach((button, index) => {
        // Убираем все старые обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log(`📅 Клик по кнопке календаря #${index + 1}`);
            
            // Простая проверка авторизации
            const authToken = localStorage.getItem('authToken');
            const currentUser = localStorage.getItem('currentUser');
            
            if (authToken && currentUser) {
                console.log('✅ Пользователь авторизован, переход к календарю');
                safeNavigate('calendar.html');
            } else {
                console.log('🔐 Пользователь не авторизован, переход к авторизации');
                safeNavigate('auth.html?returnTo=calendar');
            }
        });
        
        console.log(`✅ Обработчик добавлен к кнопке календаря #${index + 1}`);
    });
    
    // Виджет календаря
    const calendarWidget = document.getElementById('calendarWidget');
    if (calendarWidget) {
        console.log('📅 Настройка виджета календаря...');
        
        // Убираем старые обработчики
        const newWidget = calendarWidget.cloneNode(true);
        calendarWidget.parentNode.replaceChild(newWidget, calendarWidget);
        
        newWidget.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📅 Клик по виджету календаря');
            
            const authToken = localStorage.getItem('authToken');
            const currentUser = localStorage.getItem('currentUser');
            
            if (authToken && currentUser) {
                safeNavigate('calendar.html');
            } else {
                safeNavigate('auth.html?returnTo=calendar');
            }
        });
        
        console.log('✅ Виджет календаря настроен');
    }
    
    console.log('🎉 Простая навигация настроена успешно!');
}

// Запуск при любом состоянии DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSimpleNavigation);
} else {
    setupSimpleNavigation();
}

// Дополнительный запуск через полсекунды для надежности
setTimeout(setupSimpleNavigation, 500);

// Глобальная функция для проверки
window.testNavigation = function() {
    console.log('=== ТЕСТ НАВИГАЦИИ ===');
    console.log('Кнопки "Начать приключение":', document.querySelectorAll('.start-button:not(.calendar-button)').length);
    console.log('Кнопки календаря:', document.querySelectorAll('.calendar-button').length);
    console.log('Виджет календаря:', !!document.getElementById('calendarWidget'));
    console.log('Токен авторизации:', !!localStorage.getItem('authToken'));
    console.log('Данные пользователя:', !!localStorage.getItem('currentUser'));
    
    // Тестируем клик
    const startBtn = document.querySelector('.start-button:not(.calendar-button)');
    if (startBtn) {
        console.log('🧪 Тестируем кнопку "Начать приключение"...');
        startBtn.click();
    }
};

console.log('✅ Простое исправление навигации загружено');
console.log('🧪 Для тестирования: testNavigation()');
