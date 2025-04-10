/**
 * Класс для загрузки контента с улучшенной обработкой
 */
class ContentLoader {
    static async loadContent(url) {
        const container = document.getElementById('content-container');
        if (!container) return;
        
        try {
            // Показать индикатор загрузки
            this.showLoading(container);
            
            // Загрузка контента
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            
            // Вставить контент с анимацией
            container.innerHTML = html;
            container.classList.add('content-loaded');
            
            // Прокрутка к началу
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            this.showError(container, url, error);
        }
    }

    static showLoading(container) {
        container.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner"></i>
                <p>Загрузка контента...</p>
            </div>
        `;
    }

    static showError(container, url, error) {
        console.error('Ошибка загрузки:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Ошибка загрузки: ${error.message}</p>
                <button onclick="ContentLoader.loadContent('${url}')">
                    <i class="fas fa-sync-alt"></i> Попробовать снова
                </button>
                <button onclick="ContentLoader.showRulesList()" class="back-to-rules">
                    <i class="fas fa-arrow-left"></i> Вернуться к списку
                </button>
            </div>
        `;
    }

    static async loadIntroduction() {
        await this.loadContent('introduction.html');
    }

    static showRulesList() {
        const container = document.getElementById('content-container');
        if (container) {
            container.innerHTML = `
                <h1>Правила Codex</h1>
                <p>Выберите категорию и версию правил в боковой панели.</p>
            `;
            container.classList.remove('content-loaded');
        }
    }
}

// Инициализация обработчиков
document.addEventListener('DOMContentLoaded', () => {
    // Обработка кликов по ссылкам в версиях
    document.querySelectorAll('.version-content a').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.classList.contains('load-intro')) return;
            e.preventDefault();
            const contentUrl = this.getAttribute('href');
            if (contentUrl && contentUrl !== '#') {
                ContentLoader.loadContent(contentUrl);
            }
        });
    });
});