// Быстрое исправление для интеграции с улучшенной системой авторизации
// Добавляем обратную совместимость для навигации

// Ждем полной загрузки системы
document.addEventListener('DOMContentLoaded', function() {
    // Небольшая задержка для гарантии загрузки всех систем
    setTimeout(initializeNavigation, 500);
});

function initializeNavigation() {
    console.log('🔗 Инициализация навигации с улучшенной авторизацией...');
    
    // Обработка кнопки "Начать приключение"
    const startButtons = document.querySelectorAll('.start-button:not(.calendar-button)');
    startButtons.forEach(button => {
        // Убираем старые обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('🚀 Переход к контенту...');
            
            try {
                // Если есть система переходов, используем её
                if (window.UniversalPageTransitions && !window.UniversalPageTransitions.isTransitioning) {
                    window.UniversalPageTransitions.performTransition('content.html?from=index', 'main-page');
                } else {
                    // Простой переход
                    window.location.href = 'content.html?from=index';
                }
            } catch (error) {
                console.warn('⚠️ Ошибка анимированного перехода, используем простой:', error);
                window.location.href = 'content.html?from=index';
            }
        });
    });

    // Обработка кнопки "Календарь"
    const calendarButtons = document.querySelectorAll('.calendar-button, .start-button.calendar-button');
    calendarButtons.forEach(button => {
        // Убираем старые обработчики
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        newButton.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('📅 Переход к календарю...');
            
            try {
                // Проверяем авторизацию
                let isAuthenticated = false;
                
                // Ждем инициализации authManager
                if (window.authManager) {
                    // Если система еще инициализируется, ждем
                    let attempts = 0;
                    while (!window.authManager.isInitialized && attempts < 10) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        attempts++;
                    }
                    
                    isAuthenticated = window.authManager.isAuthenticated();
                    console.log('🔐 Статус авторизации:', isAuthenticated);
                }
                
                const targetUrl = isAuthenticated ? 'calendar.html' : 'auth.html?returnTo=calendar';
                
                // Используем анимированный переход если доступен
                if (window.UniversalPageTransitions && !window.UniversalPageTransitions.isTransitioning) {
                    window.UniversalPageTransitions.performTransition(targetUrl, 'calendar-page');
                } else {
                    // Простой переход
                    window.location.href = targetUrl;
                }
                
            } catch (error) {
                console.warn('⚠️ Ошибка при переходе к календарю:', error);
                // Безопасный fallback - всегда через авторизацию
                window.location.href = 'auth.html?returnTo=calendar';
            }
        });
    });

    // Обработка виджета календаря на странице контента
    const calendarWidget = document.getElementById('calendarWidget');
    if (calendarWidget) {
        calendarWidget.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('📅 Клик по виджету календаря...');
            
            try {
                let isAuthenticated = false;
                
                if (window.authManager) {
                    // Ждем инициализации
                    let attempts = 0;
                    while (!window.authManager.isInitialized && attempts < 10) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        attempts++;
                    }
                    isAuthenticated = window.authManager.isAuthenticated();
                }
                
                const targetUrl = isAuthenticated ? 'calendar.html' : 'auth.html?returnTo=calendar';
                
                if (window.UniversalPageTransitions && !window.UniversalPageTransitions.isTransitioning) {
                    window.UniversalPageTransitions.performTransition(targetUrl, 'to-calendar');
                } else {
                    window.location.href = targetUrl;
                }
                
            } catch (error) {
                console.warn('⚠️ Ошибка виджета календаря:', error);
                window.location.href = 'auth.html?returnTo=calendar';
            }
        });
    }

    // Дополнительная обработка для кнопок навигации
    setupAdditionalNavigation();
    
    console.log('✅ Навигация инициализирована успешно');
}

function setupAdditionalNavigation() {
    // Обработка ссылок возврата
    const backButtons = document.querySelectorAll('.back-btn, [href="index.html"]');
    backButtons.forEach(button => {
        if (button.dataset.navigationSetup) return; // Избегаем дублирования
        button.dataset.navigationSetup = 'true';
        
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && (href === 'index.html' || href.includes('index.html'))) {
                e.preventDefault();
                
                try {
                    if (window.UniversalPageTransitions && !window.UniversalPageTransitions.isTransitioning) {
                        window.UniversalPageTransitions.performTransition('index.html', 'back-to-main');
                    } else {
                        window.location.href = 'index.html';
                    }
                } catch (error) {
                    window.location.href = 'index.html';
                }
            }
        });
    });

    // Обработка кнопок выхода
    const logoutButtons = document.querySelectorAll('#logoutBtn, .logout-btn');
    logoutButtons.forEach(button => {
        if (button.dataset.logoutSetup) return;
        button.dataset.logoutSetup = 'true';
        
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('👋 Выход из системы...');
            
            try {
                // Выполняем выход
                if (window.authManager && window.authManager.logout) {
                    await window.authManager.logout();
                } else {
                    // Очистка данных вручную
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('currentUser');
                    if (window.PersistentStorage) {
                        window.PersistentStorage.removeItem('authToken');
                        window.PersistentStorage.removeItem('currentUser');
                    }
                }
                
                // Переход на главную
                if (window.UniversalPageTransitions && !window.UniversalPageTransitions.isTransitioning) {
                    window.UniversalPageTransitions.performTransition('index.html', 'logout');
                } else {
                    window.location.href = 'index.html';
                }
                
            } catch (error) {
                console.warn('⚠️ Ошибка при выходе:', error);
                window.location.href = 'index.html';
            }
        });
    });
}

// Дополнительная проверка для случаев, когда DOMContentLoaded уже прошел
if (document.readyState === 'loading') {
    // DOM еще загружается, обработчик уже установлен выше
} else {
    // DOM уже загружен
    setTimeout(initializeNavigation, 100);
}

// Глобальная функция для отладки навигации
window.debugNavigation = function() {
    console.log('=== ОТЛАДКА НАВИГАЦИИ ===');
    console.log('AuthManager:', window.authManager);
    console.log('AuthManager инициализирован:', window.authManager?.isInitialized);
    console.log('Авторизован:', window.authManager?.isAuthenticated());
    console.log('UniversalPageTransitions:', window.UniversalPageTransitions);
    console.log('Кнопки "Начать приключение":', document.querySelectorAll('.start-button:not(.calendar-button)').length);
    console.log('Кнопки календаря:', document.querySelectorAll('.calendar-button').length);
    console.log('Виджет календаря:', !!document.getElementById('calendarWidget'));
};

console.log('🔗 Система навигации с улучшенной авторизацией загружена');
console.log('💡 Для отладки используйте: debugNavigation()');
