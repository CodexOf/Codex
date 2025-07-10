/**
 * КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Немедленное восстановление взаимодействия
 * Этот код выполняется сразу при загрузке страницы
 */

// Немедленно удаляем все блокировки
document.body.classList.remove('transitioning');
document.body.style.pointerEvents = 'auto';

// Добавляем критические стили
const criticalStyles = document.createElement('style');
criticalStyles.textContent = `
    body, body * {
        pointer-events: auto !important;
    }
    
    .auth-container,
    .auth-container *,
    input, button, form, a, select {
        pointer-events: auto !important;
        user-select: auto !important;
        touch-action: auto !important;
    }
    
    button, a, .auth-tab {
        cursor: pointer !important;
    }
    
    input, select {
        cursor: text !important;
    }
    
    .page-transition-overlay {
        display: none !important;
    }
`;
document.head.appendChild(criticalStyles);

// Функция для включения взаимодействия
function enableAllInteractions() {
    // Удаляем блокирующие классы
    document.body.classList.remove('transitioning');
    
    // Включаем pointer-events для всего
    document.body.style.pointerEvents = 'auto';
    
    // Находим все интерактивные элементы
    const interactiveElements = document.querySelectorAll(
        'input, button, a, select, textarea, .auth-container, .form-input, .form-button, .auth-tab, form'
    );
    
    interactiveElements.forEach(el => {
        el.style.pointerEvents = 'auto';
        if (el.disabled && !el.classList.contains('button-loading')) {
            el.disabled = false;
        }
    });
    
    // Удаляем оверлей переходов
    const overlay = document.querySelector('.page-transition-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Выполняем сразу
enableAllInteractions();

// И повторяем при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enableAllInteractions);
} else {
    enableAllInteractions();
}

// И еще раз при полной загрузке
window.addEventListener('load', enableAllInteractions);

// Постоянная защита от блокировок
setInterval(function() {
    if (document.body.classList.contains('transitioning')) {
        document.body.classList.remove('transitioning');
        enableAllInteractions();
    }
}, 50);

console.log('🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ АКТИВИРОВАНО');
