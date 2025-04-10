/**
 * Система загрузки контента (SPA)
 * Соответствует договоренностям:
 * - Плавные переходы без перезагрузки
 * - Сохранение истории навигации
 * - Обработка ошибок 404
 */
class ContentLoader {
    static baseUrl = '/';
    static isLoading = false;

    /**
     * Загружает контент с защитой от наложения
     * @param {string} url - URL для загрузки
     */
    static async loadContent(url) {
        // Проверка состояния загрузки
        if (this.isLoading) return;
        this.isLoading = true;
        
        const container = document.getElementById('content-container');
        if (!container) return;

        // Подготовка контейнера
        container.style.opacity = '0';
        container.style.pointerEvents = 'none';

        try {
            // Нормализация URL
            const fullUrl = url.startsWith('/') 
                ? url 
                : `${this.baseUrl}${url}`;

            // Показать индикатор загрузки
            container.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            `;
            container.style.opacity = '1';

            // Запрос с контролем кеширования
            const response = await fetch(fullUrl, {
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Вставка контента
            const html = await response.text();
            container.innerHTML = html;
            history.pushState(null, '', fullUrl);

            // Плавное появление
            container.style.opacity = '0';
            setTimeout(() => {
                container.style.opacity = '1';
                container.style.pointerEvents = 'auto';
            }, 300);

        } catch (error) {
            // Обработка ошибок
            console.error('Load error:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()">Обновить</button>
                </div>
            `;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Инициализация системы
     * @param {string} baseUrl - Базовый URL (/Codex/ или /)
     */
    static init(baseUrl = '/') {
        this.baseUrl = baseUrl;
        
        // Обработчик для ссылок навигации
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadContent(link.getAttribute('href'));
            });
        });

        // Обработчик истории браузера
        window.addEventListener('popstate', () => {
            this.loadContent(window.location.pathname);
        });
    }
}