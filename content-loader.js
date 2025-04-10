/**
 * Класс для загрузки контента правил игры
 * Добавлены: 
 * - Подробные ошибки
 * - Кнопка обновления
 * - Индикатор загрузки
 * Убрана анимация перехода между разделами
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

            // Загрузка HTML-файла с правилами
            const response = await fetch('introduction.html');
            if (!response.ok) throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            
            // Парсинг полученного HTML
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Извлечение контента или сообщение об ошибке, если не найден
            const content = doc.querySelector('.rule-section')?.innerHTML || '<p>Контент не найден</p>';
            
            // Вставка контента в контейнер
            container.innerHTML = `
                <div class="rule-section">
                    ${content}
                    <button class="back-to-rules" onclick="ContentLoader.showRulesList()">
                        ← Вернуться к списку правил
                    </button>
                </div>
            `;
            
        } catch (error) {
            // Обработка ошибок загрузки
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

    /**
     * Показывает список правил (возврат к основному виду)
     */
    static showRulesList() {
        document.getElementById('content-container').innerHTML = `
            <h1>Правила Codex</h1>
            <p>Выберите категорию и версию правил в боковой панели.</p>
        `;
    }
}

// Инициализация обработчиков событий после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Находим все ссылки на "Введение" и добавляем обработчики
    document.querySelectorAll('.version-content a').forEach(link => {
        if (link.textContent.includes('Введение')) {
            link.addEventListener('click', (e) => {
                e.preventDefault(); // Отменяем стандартное поведение
                ContentLoader.loadIntroduction(); // Загружаем контент
            });
        }
    });
});