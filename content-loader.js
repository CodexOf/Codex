class ContentLoader {
    static currentPage = null;
    
    static async loadContent(url) {
        const container = document.getElementById('content-container');
        if (!container) {
            console.error('Контейнер контента не найден');
            return;
        }

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
            
            if (!response.ok) {
                throw new Error(`Страница не найдена (${response.status})`);
            }
            
            const html = await response.text();
            
            // Плавное появление контента
            container.innerHTML = html;
            container.style.opacity = '0';
            
            // Анимация появления
            setTimeout(() => {
                container.style.opacity = '1';
            }, 100);
            
            // Обновляем активную кнопку
            this.updateActiveButton(url);
            
            // Обновляем URL в адресной строке
            const pageParam = url.replace('partials/', '').replace('.html', '');
            history.pushState({ page: pageParam }, '', `?page=${pageParam}`);
            
            // Прокрутка вверх
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Сохраняем текущую страницу
            this.currentPage = url;
            
        } catch (error) {
            console.error('Ошибка загрузки контента:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить страницу: ${error.message}</p>
                    <button class="retry-btn" onclick="ContentLoader.loadContent('${url}')">
                        <i class="fas fa-sync-alt"></i> Попробовать снова
                    </button>
                    <button class="home-btn" onclick="ContentLoader.loadContent('partials/main.html')">
                        <i class="fas fa-home"></i> На главную
                    </button>
                </div>
            `;
            container.style.opacity = '1';
        }
    }

    static updateActiveButton(url) {
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            const isActive = link.getAttribute('href') === url;
            link.classList.toggle('active', isActive);
        });
    }

    static initAccordions() {
        // Инициализация аккордеонов
        document.querySelectorAll('.codex-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const section = this.parentElement;
                const isActive = section.classList.contains('active');
                
                // Закрываем все секции
                document.querySelectorAll('.codex-section').forEach(s => {
                    s.classList.remove('active');
                });
                
                // Открываем текущую секцию если она была закрыта
                if (!isActive) {
                    section.classList.add('active');
                }
            });
        });
    }

    static initNavigation() {
        // Обработка всех ссылок в сайдбаре
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.loadContent(href);
            });
        });
    }

    static init() {
        // Инициализация аккордеонов
        this.initAccordions();
        
        // Инициализация навигации
        this.initNavigation();

        // Обработка кнопок назад/вперед браузера
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                const url = `partials/${event.state.page}.html`;
                this.loadContent(url);
            } else {
                // Если нет состояния, загружаем главную
                this.loadContent('partials/main.html');
            }
        });

        // Загрузка начального контента
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || 'main';
        const initialUrl = `partials/${page}.html`;
        this.loadContent(initialUrl);
    }

    static reload() {
        if (this.currentPage) {
            this.loadContent(this.currentPage);
        } else {
            this.loadContent('partials/main.html');
        }
    }
}

// Инициализация после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Ждем пока все элементы будут готовы
    setTimeout(() => {
        ContentLoader.init();
    }, 100);
});

// Экспорт для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoader;
} else if (typeof window !== 'undefined') {
    window.ContentLoader = ContentLoader;
}