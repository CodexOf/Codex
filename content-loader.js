/**
 * Класс для загрузки контента с защитой от наложения
 */
class ContentLoader {
    static isLoading = false; // Флаг блокировки параллельных загрузок

    /**
     * Загружает контент с защитой от наложения
     * @param {string} url - URL для загрузки
     */
    static async loadContent(url) {
        const container = document.getElementById('content-container');
        if (!container || this.isLoading) return;

        // Блокируем повторные вызовы
        this.isLoading = true;
        
        // 1. Подготовка контейнера
        container.style.opacity = '0'; // Плавное исчезновение
        container.style.pointerEvents = 'none'; // Блокируем взаимодействие
        
        // 2. Показываем индикатор загрузки
        const loaderHtml = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
        `;
        container.innerHTML = loaderHtml;
        container.style.opacity = '1';

        try {
            // 3. Загрузка данных с защитой от кеширования
            const response = await fetch(url, {
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // 4. Полная очистка перед вставкой
            const html = await response.text();
            container.replaceChildren(); // Важно: полная очистка DOM
            
            // 5. Безопасная вставка нового контента
            container.innerHTML = html;
            
            // 6. Плавное появление с requestAnimationFrame
            requestAnimationFrame(() => {
                container.style.opacity = '0';
                requestAnimationFrame(() => {
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                });
            });
            
            // 7. Обновляем историю браузера
            history.pushState(null, '', url);
            
        } catch (error) {
            // 8. Обработка ошибок с восстановлением
            console.error('Load error:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Ошибка загрузки: ${error.message}</p>
                    <button onclick="window.location.reload()">Обновить</button>
                </div>
            `;
        } finally {
            // 9. Всегда снимаем блокировку
            this.isLoading = false;
        }
    }

    /**
     * Инициализация обработчиков событий
     */
    static init() {
        // Обработчик для ссылок в сайдбаре
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadContent(link.href);
            });
        });

        // Обработчик кнопок назад/вперед
        window.addEventListener('popstate', () => {
            this.loadContent(window.location.pathname);
        });
    }
}

// Автоматическая инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => ContentLoader.init());