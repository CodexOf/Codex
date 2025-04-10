class ContentLoader {
    static async loadContent(url) {
        const container = document.getElementById('content-container');
        if (!container) return;

        // Показываем индикатор загрузки
        container.style.opacity = '0.5';
        container.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Загрузка...</p>
            </div>
        `;

        try {
            // Нормализация URL для GitHub Pages и локального сервера
            let normalizedUrl = url;
            
            // Если это GitHub Pages
            if (window.location.host.includes('github.io')) {
                // Удаляем возможные дублирования /Codex/
                normalizedUrl = url.replace('/Codex/', '').replace('Codex/', '');
                // Добавляем базовый путь
                normalizedUrl = `/Codex/${normalizedUrl}`;
            }
            
            // Для локального сервера оставляем как есть
            const response = await fetch(normalizedUrl);
            
            if (!response.ok) throw new Error(`Ошибка ${response.status}`);
            
            const html = await response.text();
            
            // Плавное появление контента
            container.innerHTML = html;
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.opacity = '1';
            }, 50);
            
            // Обновляем URL в адресной строке
            history.pushState(null, '', normalizedUrl);
            
            // Прокрутка вверх
            window.scrollTo(0, 0);
            
        } catch (error) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Не удалось загрузить страницу: ${error.message}</p>
                    <button class="retry-btn" onclick="ContentLoader.loadContent('${url}')">
                        <i class="fas fa-sync-alt"></i> Попробовать снова
                    </button>
                    <button class="home-btn" onclick="ContentLoader.loadContent('/Codex/index.html')">
                        <i class="fas fa-home"></i> На главную
                    </button>
                </div>
            `;
            container.style.opacity = '1';
        }
    }

    static init() {
        // Обработка всех ссылок в сайдбаре
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadContent(link.getAttribute('href'));
            });
        });

        // Обработка кнопок назад/вперед
        window.addEventListener('popstate', () => {
            this.loadContent(window.location.pathname);
        });

        // Загрузка контента при первом открытии
        if (!window.location.pathname.endsWith('content.html')) {
            this.loadContent(window.location.pathname);
        }
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    ContentLoader.init();
});