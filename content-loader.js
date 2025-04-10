/**
 * Класс для загрузки контента правил игры
 * Добавлены: 
 * - Подробные ошибки
 * - Кнопка обновления
 * - Индикатор загрузки
 */
class ContentLoader {
    static async loadIntroduction() {
        const container = document.getElementById('content-container');
        
        try {
            // Показываем индикатор загрузки
            container.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Загрузка правил...</p>
                </div>
            `;

            const response = await fetch('introduction.html');
            if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.querySelector('.rule-section')?.innerHTML || '<p>Контент не найден</p>';
            
            container.innerHTML = `
                <div class="rule-section">
                    ${content}
                    <button class="back-to-rules" onclick="ContentLoader.showRulesList()">
                        ← Вернуться к списку правил
                    </button>
                </div>
            `;

            document.querySelector('.main-content').scrollTo(0, 0);
            
        } catch (error) {
            console.error('Ошибка:', error);
            container.innerHTML = `
                <div class="error-message">
                    <p>Ошибка загрузки: ${error.message}</p>
                    <button onclick="ContentLoader.loadIntroduction()">
                        <i class="fas fa-sync-alt"></i> Попробовать снова
                    </button>
                </div>
            `;
        }
    }

    static showRulesList() {
        document.getElementById('content-container').innerHTML = `
            <h1>Правила Codex</h1>
            <p>Выберите категорию и версию правил в боковой панели.</p>
        `;
    }
}

// Инициализация (без изменений)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.version-content a').forEach(link => {
        if (link.textContent.includes('Введение')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                ContentLoader.loadIntroduction();
            });
        }
    });
});