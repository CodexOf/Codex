/**
 * Специальное исправление для системы переходов на странице авторизации
 * Предотвращает блокировку взаимодействия после перехода
 */

(function() {
    console.log('🔧 Исправление системы переходов для страницы авторизации...');
    
    // Переопределяем функцию handlePageEntrance для страницы авторизации
    if (window.UniversalPageTransitions) {
        const originalHandlePageEntrance = window.UniversalPageTransitions.handlePageEntrance;
        
        window.UniversalPageTransitions.handlePageEntrance = function() {
            // Проверяем, пришли ли мы с другой страницы через анимацию
            const fromTransition = sessionStorage.getItem('pageTransition');
            
            if (fromTransition) {
                console.log('📥 Пропускаем анимацию перехода на странице авторизации');
                
                // Немедленно удаляем блокировку
                document.body.classList.remove('transitioning');
                document.body.classList.add('animation-complete');
                
                // Удаляем оверлей
                if (this.overlay) {
                    this.overlay.style.display = 'none';
                    this.overlay.classList.remove('active');
                }
                
                // Очищаем состояние
                sessionStorage.removeItem('pageTransition');
                
                // Принудительно включаем взаимодействие
                document.body.style.pointerEvents = 'auto';
                
                const authElements = document.querySelectorAll('.auth-container, .form-input, .form-button, .auth-tab, input, button, form, a, select');
                authElements.forEach(el => {
                    el.style.pointerEvents = 'auto';
                });
                
                console.log('✅ Взаимодействие восстановлено после перехода');
            } else {
                // Обычная загрузка страницы
                setTimeout(() => {
                    document.body.classList.add('animation-complete');
                }, 100);
            }
        };
        
        // Также переопределяем init для страницы авторизации
        const originalInit = window.UniversalPageTransitions.init;
        
        window.UniversalPageTransitions.init = function() {
            console.log('🚀 Модифицированная инициализация UniversalPageTransitions для auth-local...');
            
            // Вызываем оригинальный init
            originalInit.call(this);
            
            // Но немедленно удаляем любые блокировки
            setTimeout(() => {
                document.body.classList.remove('transitioning');
                document.body.style.pointerEvents = 'auto';
                
                // Удаляем обработчики переходов для форм
                const authForms = document.querySelectorAll('form[data-auth-form]');
                authForms.forEach(form => {
                    form.removeEventListener('submit', () => {});
                });
                
                console.log('✅ Блокировки удалены после инициализации');
            }, 100);
        };
        
        // Сразу вызываем handlePageEntrance
        window.UniversalPageTransitions.handlePageEntrance();
    }
    
    // Дополнительная защита: каждые 100мс проверяем и удаляем блокировки
    const protectionInterval = setInterval(() => {
        if (document.body.classList.contains('transitioning')) {
            document.body.classList.remove('transitioning');
            document.body.style.pointerEvents = 'auto';
            console.log('⚠️ Удалена нежелательная блокировка transitioning');
        }
    }, 100);
    
    // Останавливаем проверку через 5 секунд
    setTimeout(() => {
        clearInterval(protectionInterval);
        console.log('🛡️ Защита от блокировок завершена');
    }, 5000);
    
    console.log('✅ Исправление системы переходов активировано');
})();
