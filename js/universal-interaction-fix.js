/**
 * Универсальное исправление взаимодействия для всех страниц
 * Решает проблемы с недоступными кнопками после анимаций
 */

(function() {
    console.log('🔧 Активация универсального исправления взаимодействия...');
    
    // Функция для включения взаимодействия
    function enableAllInteractions() {
        // Удаляем блокирующие классы
        document.body.classList.remove('transitioning');
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        
        // Добавляем класс завершения анимации
        if (!document.body.classList.contains('animation-complete')) {
            document.body.classList.add('animation-complete');
        }
        
        // Удаляем оверлеи переходов
        const overlays = document.querySelectorAll('.page-transition-overlay');
        overlays.forEach(overlay => {
            if (!overlay.classList.contains('active')) {
                overlay.style.display = 'none';
                overlay.style.pointerEvents = 'none';
            }
        });
        
        // Включаем pointer-events для всех интерактивных элементов
        const interactiveSelectors = [
            'button',
            'a',
            'input',
            'select',
            'textarea',
            '.calendar-day',
            '.calendar-nav-btn',
            '.event-item',
            '.nav-btn',
            '.codex-btn',
            '.calendar-widget',
            '.content-widget',
            '.color-option',
            '.btn-primary',
            '.btn-secondary',
            '.modal-close',
            '[onclick]',
            '[role="button"]'
        ];
        
        interactiveSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.pointerEvents = 'auto';
                el.style.cursor = 'pointer';
            });
        });
        
        console.log('✅ Взаимодействие включено для всех элементов');
    }
    
    // Выполняем сразу
    enableAllInteractions();
    
    // Выполняем при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enableAllInteractions);
    }
    
    // Выполняем после полной загрузки
    window.addEventListener('load', function() {
        setTimeout(enableAllInteractions, 100);
        setTimeout(enableAllInteractions, 500);
        setTimeout(enableAllInteractions, 1000);
    });
    
    // Следим за изменениями класса transitioning
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (document.body.classList.contains('transitioning')) {
                    console.log('⚠️ Обнаружен класс transitioning');
                    // Даем время на анимацию, затем включаем взаимодействие
                    setTimeout(enableAllInteractions, 1500);
                }
            }
        });
    });
    
    // Начинаем наблюдение
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // Особая обработка для календаря
    if (window.location.pathname.includes('calendar.html')) {
        console.log('📅 Специальная активация для календаря');
        
        // Ждем загрузку календаря
        setTimeout(function() {
            const calendarDays = document.querySelectorAll('.calendar-day');
            const calendarButtons = document.querySelectorAll('.calendar-nav-btn, .btn-primary, .btn-secondary');
            
            calendarDays.forEach(day => {
                day.style.pointerEvents = 'auto';
                day.style.cursor = 'pointer';
                day.style.position = 'relative';
                day.style.zIndex = '1';
            });
            
            calendarButtons.forEach(btn => {
                btn.style.pointerEvents = 'auto';
                btn.style.cursor = 'pointer';
            });
            
            console.log(`✅ Активировано ${calendarDays.length} дней календаря`);
            console.log(`✅ Активировано ${calendarButtons.length} кнопок`);
        }, 1000);
    }
    
    // Особая обработка для контента
    if (window.location.pathname.includes('content.html')) {
        console.log('📚 Специальная активация для контента');
        
        setTimeout(function() {
            const navButtons = document.querySelectorAll('.nav-btn, .codex-btn');
            const sidebar = document.querySelector('.sidebar');
            
            navButtons.forEach(btn => {
                btn.style.pointerEvents = 'auto';
                btn.style.cursor = 'pointer';
                btn.style.display = 'block';
            });
            
            if (sidebar) {
                sidebar.style.pointerEvents = 'auto';
            }
            
            console.log(`✅ Активировано ${navButtons.length} кнопок навигации`);
        }, 1000);
    }
    
    // Глобальный обработчик для отладки
    document.addEventListener('click', function(e) {
        if (e.target.closest('.calendar-day, .calendar-nav-btn, .nav-btn, .codex-btn')) {
            console.log('🖱️ Клик зарегистрирован:', e.target.tagName, e.target.className);
        }
    }, true);
    
    console.log('🛡️ Универсальное исправление взаимодействия активировано');
})();
