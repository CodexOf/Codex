/**
 * Класс для загрузки контента правил игры
 * Добавлен для работы с динамической загрузкой контента
 */
class ContentLoader {
    /**
     * Загружает содержимое страницы "Введение" из introduction.html
     */
    static async loadIntroduction() {
        try {
            // Загружаем HTML-файл с правилами
            const response = await fetch('introduction.html');
            if (!response.ok) throw new Error('Не удалось загрузить файл');
            
            // Парсим полученный HTML
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Извлекаем нужный контент
            const content = doc.querySelector('.rule-section').innerHTML;
            
            // Вставляем контент в контейнер
            document.getElementById('content-container').innerHTML = `
                <div class="rule-section">
                    ${content}
                </div>
            `;
            
            // Прокручиваем к началу контента
            document.querySelector('.main-content').scrollTo(0, 0);
            
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            document.getElementById('content-container').innerHTML = `
                <div class="error-message">
                    <p>Не удалось загрузить правила. Пожалуйста, попробуйте позже.</p>
                </div>
            `;
        }
    }
}

// Инициализация обработчиков после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчик для всех ссылок "Введение"
    document.querySelectorAll('.version-content a').forEach(link => {
        if (link.textContent.includes('Введение')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                ContentLoader.loadIntroduction();
            });
        }
    });
});