/**
 * Класс для загрузки контента правил игры
 */
class ContentLoader {
    static async loadContent(url) {
        const container = document.getElementById('content-container');
        
        try {
            // Показываем индикатор загрузки
            container.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Загрузка контента...</p>
                </div>
            `;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            
            const html = await response.text();
            container.innerHTML = html;
            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Ошибка загрузки: ${error.message}</p>
                    <button onclick="ContentLoader.loadContent('${url}')">
                        <i class="fas fa-sync-alt"></i> Попробовать снова
                    </button>
                </div>
            `;
        }
    }

    static async loadIntroduction() {
        await this.loadContent('introduction.html');
    }

    static showRulesList() {
        document.getElementById('content-container').innerHTML = `
            <h1>Правила Codex</h1>
            <p>Выберите категорию и версию правил в боковой панели.</p>
        `;
    }
}

// Инициализация обработчиков
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.version-content a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const contentUrl = this.getAttribute('href');
            if (contentUrl === '#') return;
            
            if (this.textContent.includes('Введение')) {
                ContentLoader.loadIntroduction();
            } else {
                ContentLoader.loadContent(contentUrl);
            }
        });
    });
});