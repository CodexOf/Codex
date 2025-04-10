class ContentLoader {
    static async loadContent(url) {
        const container = document.getElementById('content-container');
        if (!container) return;
        
        try {
            container.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Загрузка контента...</p>
                </div>
            `;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Ошибка ${response.status}`);
            
            const html = await response.text();
            container.innerHTML = html;
            
        } catch (error) {
            container.innerHTML = `
                <div class="error-message">
                    <p>Ошибка загрузки: ${error.message}</p>
                    <button onclick="ContentLoader.loadContent('${url}')">
                        Попробовать снова
                    </button>
                </div>
            `;
        }
    }

    static async loadIntroduction() {
        await this.loadContent('introduction.html');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.load-intro')?.addEventListener('click', (e) => {
        e.preventDefault();
        ContentLoader.loadIntroduction();
    });
});