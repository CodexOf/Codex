// ВЕСЬ ВАШ ОРИГИНАЛЬНЫЙ КОД (класс PageTransitions)
class PageTransitions {
    static init() {
        this.setupPageTransitions();
        // ... ваш код ...
    }
    // ... все ваши методы ...
}

// === ДОБАВЛЕНО В КОНЕЦ ФАЙЛА ===
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('swup')) {
        document.addEventListener('swup:clickLink', () => {
            document.documentElement.classList.add('is-changing');
        });
        document.addEventListener('swup:contentReplaced', () => {
            document.documentElement.classList.remove('is-changing');
            document.documentElement.classList.add('is-rendering');
            setTimeout(() => {
                document.documentElement.classList.remove('is-rendering');
            }, 400);
        });
    }
});

// Ваш оригинальный вызов
document.addEventListener('DOMContentLoaded', () => PageTransitions.init());