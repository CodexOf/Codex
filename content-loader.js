class ContentLoader {
    static async loadContent(url) {
        const container = document.getElementById('content-container');
        if (!container) return;

        // Плавное исчезновение текущего контента
        container.style.opacity = '0';
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Ошибка ${response.status}`);
            
            const html = await response.text();
            
            // Вставка нового контента с анимацией
            setTimeout(() => {
                container.innerHTML = html;
                container.style.opacity = '1';
                window.scrollTo(0, 0); // Сброс скролла
                
                // Обновляем активный пункт меню
                document.querySelectorAll('.sidebar-nav a').forEach(link => {
                    link.classList.toggle('active', link.href === url);
                });
            }, 300);

            // Обновляем URL без перезагрузки
            history.pushState(null, '', url);

        } catch (error) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Ошибка загрузки: ${error.message}</p>
                    <button onclick="ContentLoader.loadContent('${url}')">
                        Попробовать снова
                    </button>
                </div>
            `;
            container.style.opacity = '1';
        }
    }

    static init() {
        // Обработка кликов в сайдбаре
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadContent(link.href);
            });
        });

        // Обработка кнопок "Назад"/"Вперёд"
        window.addEventListener('popstate', () => {
            this.loadContent(window.location.href);
        });
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    ContentLoader.init();
});