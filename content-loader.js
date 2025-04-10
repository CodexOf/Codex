class ContentLoader {
    static baseUrl = '/';
    static isLoading = false;

    static async loadContent(url) {
        if (this.isLoading) return;
        this.isLoading = true;

        const container = document.getElementById('content-container');
        if (!container) return;

        // Нормализация URL
        const fullUrl = url.startsWith('/') 
            ? url 
            : `${this.baseUrl}${url}`;

        try {
            // Показ индикатора загрузки
            container.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            `;

            // Запрос с контролем кеширования
            const response = await fetch(fullUrl, {
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            const html = await response.text();
            container.innerHTML = html;
            history.pushState(null, '', fullUrl);

        } catch (error) {
            console.error('Ошибка:', error);
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

    static init(baseUrl = '/') {
        this.baseUrl = baseUrl;
        
        // Обработчик для ссылок
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadContent(link.getAttribute('href'));
            });
        });

        // Обработчик истории
        window.addEventListener('popstate', () => {
            this.loadContent(window.location.pathname);
        });
    }
}