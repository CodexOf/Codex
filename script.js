// ВСЁ СУЩЕСТВУЮЩЕЕ СОДЕРЖАНИЕ ОСТАЁТСЯ БЕЗ ИЗМЕНЕНИЙ

// ДОБАВЛЕНО: Логика для плавных переходов
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Swup только для content-страниц
    if (!window.location.pathname.includes('index.html') && document.getElementById('swup')) {
        const swup = new Swup({
            containers: ['#swup'],
            plugins: [new SwupScrollPlugin()],
            cache: true,
            animateHistoryBrowsing: true,
            linkSelector: 'a[href$=".html"]:not([href*="index.html"])'
        });

        // Обработчики событий для кастомной логики
        swup.on('clickLink', () => {
            document.documentElement.classList.add('is-changing');
        });

        swup.on('contentReplaced', () => {
            document.documentElement.classList.remove('is-changing');
            document.documentElement.classList.add('is-rendering');
            setTimeout(() => {
                document.documentElement.classList.remove('is-rendering');
            }, 400);
        });
    }
});

// Остальной существующий JavaScript код остаётся без изменений