/**
 * Критическое исправление проблемы с недоступными кнопками на странице авторизации
 * Проблема: класс 'transitioning' блокирует pointer-events на всех элементах
 */

(function() {
    console.log('🔧 Исправление проблемы с взаимодействием на странице авторизации...');
    
    // Функция для принудительного удаления блокирующих классов
    function forceEnableInteraction() {
        // Удаляем класс transitioning с body
        document.body.classList.remove('transitioning');
        
        // Принудительно включаем pointer-events для body
        document.body.style.pointerEvents = 'auto';
        
        // Принудительно включаем pointer-events для всех элементов авторизации
        const authElements = [
            '.auth-container',
            '.form-input', 
            '.form-button',
            '.auth-tab',
            '.auth-form',
            '.back-to-site',
            'input',
            'button',
            'form',
            'a',
            'select'
        ];
        
        authElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.pointerEvents = 'auto';
                el.style.cursor = selector === 'button' || selector === 'a' || selector === '.auth-tab' ? 'pointer' : 'auto';
                
                // Удаляем любые другие блокирующие стили
                el.style.userSelect = 'auto';
                el.style.touchAction = 'auto';
                
                // Проверяем disabled атрибут
                if (el.hasAttribute('disabled')) {
                    el.removeAttribute('disabled');
                }
            });
        });
        
        // Очищаем оверлей переходов, если он есть
        const overlay = document.querySelector('.page-transition-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('active');
        }
        
        console.log('✅ Взаимодействие принудительно включено');
    }
    
    // Выполняем исправление немедленно
    forceEnableInteraction();
    
    // Повторяем через небольшие промежутки времени
    setTimeout(forceEnableInteraction, 100);
    setTimeout(forceEnableInteraction, 500);
    setTimeout(forceEnableInteraction, 1000);
    setTimeout(forceEnableInteraction, 2000);
    
    // Следим за изменениями DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (document.body.classList.contains('transitioning')) {
                    console.log('⚠️ Обнаружен класс transitioning, удаляем...');
                    forceEnableInteraction();
                }
            }
        });
    });
    
    // Начинаем наблюдение
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // Обработчик событий для проверки кликов
    document.addEventListener('click', function(e) {
        console.log('🖱️ Клик на элемент:', e.target.tagName, e.target.className);
        
        // Если клик не проходит, принудительно включаем взаимодействие
        if (e.target.closest('.auth-container')) {
            forceEnableInteraction();
        }
    }, true);
    
    // Переопределяем класс UniversalPageTransitions для этой страницы
    if (window.UniversalPageTransitions) {
        const originalReset = window.UniversalPageTransitions.reset;
        window.UniversalPageTransitions.reset = function() {
            originalReset.call(this);
            forceEnableInteraction();
        };
    }
    
    console.log('🛡️ Защита от блокировки взаимодействия активирована');
})();
