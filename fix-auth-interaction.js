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
        
        // Принудительно включаем pointer-events для всех элементов авторизации
        const authElements = [
            '.auth-container',
            '.form-input', 
            '.form-button',
            '.auth-tab',
            '.auth-form',
            '.back-to-site'
        ];
        
        authElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.pointerEvents = 'auto';
            });
        });
        
        console.log('✅ Взаимодействие принудительно включено');
    }
    
    // Выполняем исправление немедленно
    forceEnableInteraction();
    
    // Повторяем через небольшие промежутки времени
    setTimeout(forceEnableInteraction, 100);
    setTimeout(forceEnableInteraction, 500);
    setTimeout(forceEnableInteraction, 1000);
    
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
    
    console.log('🛡️ Защита от блокировки взаимодействия активирована');
})();
