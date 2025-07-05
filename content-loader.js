class ContentLoader {
    static currentPage = null;
    static isTransitioning = false;
    static animationDuration = {
        exit: 300,
        enter: 400,
        loading: 150
    };
    
    static async loadContent(url) {
        // Предотвращаем множественные одновременные переходы
        if (this.isTransitioning) {
            return;
        }
        
        const container = document.getElementById('content-container');
        if (!container) {
            console.error('Контейнер контента не найден');
            return;
        }

        // Отмечаем начало перехода
        this.isTransitioning = true;

        try {
            // Фаза 1: Анимация выхода старого контента
            await this.animateContentExit(container);
            
            // Фаза 2: Показ индикатора загрузки
            this.showLoadingIndicator(container);
            
            // Фаза 3: Загрузка нового контента
            const html = await this.fetchContent(url);
            
            // Фаза 4: Анимация входа нового контента
            await this.animateContentEnter(container, html);
            
            // Обновляем состояние
            this.updateActiveButton(url);
            this.updateBrowserHistory(url);
            this.scrollToTop();
            this.currentPage = url;
            
        } catch (error) {
            console.error('Ошибка загрузки контента:', error);
            await this.showErrorMessage(container, error.message, url);
        } finally {
            // Сбрасываем флаг перехода
            this.isTransitioning = false;
        }
    }
    
    static async animateContentExit(container) {
        return new Promise((resolve) => {
            // Добавляем класс для анимации выхода
            container.classList.add('content-exiting');
            container.style.transition = `opacity ${this.animationDuration.exit}ms ease-in, transform ${this.animationDuration.exit}ms ease-in`;
            
            // Запускаем анимацию выхода
            setTimeout(() => {
                container.classList.remove('content-exiting');
                container.classList.add('content-exited');
                container.style.opacity = '0';
                container.style.transform = 'translateX(-20px)';
                
                // Завершаем анимацию
                setTimeout(resolve, this.animationDuration.exit);
            }, 10);
        });
    }
    
    static showLoadingIndicator(container) {
        container.innerHTML = `
            <div class="loading-indicator loading-pulse">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Загрузка...</p>
            </div>
        `;
        container.style.opacity = '0.7';
        container.style.transform = 'translateX(0)';
    }
    
    static async fetchContent(url) {
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
        
        return await response.text();
    }
    
    static async animateContentEnter(container, html) {
        return new Promise((resolve) => {
            // Устанавливаем новый контент
            container.innerHTML = html;
            
            // Подготавливаем для анимации входа
            container.classList.remove('content-exited');
            container.classList.add('content-entering');
            container.style.opacity = '0';
            container.style.transform = 'translateX(20px)';
            
            // Небольшая задержка для плавности
            setTimeout(() => {
                container.style.transition = `opacity ${this.animationDuration.enter}ms ease-out, transform ${this.animationDuration.enter}ms ease-out`;
                
                // Запускаем анимацию входа
                setTimeout(() => {
                    container.classList.remove('content-entering');
                    container.classList.add('content-entered');
                    container.style.opacity = '1';
                    container.style.transform = 'translateX(0)';
                    
                    // Завершаем анимацию
                    setTimeout(() => {
                        container.classList.remove('content-entered');
                        container.style.transition = '';
                        resolve();
                    }, this.animationDuration.enter);
                }, 10);
            }, this.animationDuration.loading);
        });
    }
    
    static async showErrorMessage(container, errorMessage, url) {
        return new Promise((resolve) => {
            container.innerHTML = `
                <div class="error-message error-shake">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить страницу: ${errorMessage}</p>
                    <button class="retry-btn" onclick="ContentLoader.loadContent('${url}')">
                        <i class="fas fa-sync-alt"></i> Попробовать снова
                    </button>
                    <button class="home-btn" onclick="ContentLoader.loadContent('partials/main.html')">
                        <i class="fas fa-home"></i> На главную
                    </button>
                </div>
            `;
            
            // Анимация появления ошибки
            container.style.opacity = '0';
            container.style.transform = 'translateX(0)';
            container.style.transition = `opacity ${this.animationDuration.enter}ms ease-out`;
            
            setTimeout(() => {
                container.style.opacity = '1';
                setTimeout(resolve, this.animationDuration.enter);
            }, 10);
        });
    }
    
    static updateBrowserHistory(url) {
        const pageParam = url.replace('partials/', '').replace('.html', '');
        history.pushState({ page: pageParam }, '', `?page=${pageParam}`);
    }
    
    static scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    // Добавляем метод для быстрого перехода без анимации (для внутренних нужд)
    static async loadContentInstant(url) {
        const container = document.getElementById('content-container');
        if (!container) {
            console.error('Контейнер контента не найден');
            return;
        }

        try {
            const html = await this.fetchContent(url);
            container.innerHTML = html;
            container.style.opacity = '1';
            container.style.transform = 'translateX(0)';
            
            this.updateActiveButton(url);
            this.updateBrowserHistory(url);
            this.currentPage = url;
            
        } catch (error) {
            console.error('Ошибка быстрой загрузки:', error);
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    // Метод для предзагрузки контента
    static async preloadContent(urls) {
        const preloadPromises = urls.map(async (url) => {
            try {
                const html = await this.fetchContent(url);
                // Сохраняем в кэш (можно расширить функциональность)
                console.log(`Предзагружен контент: ${url}`);
                return { url, html, success: true };
            } catch (error) {
                console.warn(`Не удалось предзагрузить: ${url}`, error);
                return { url, error, success: false };
            }
        });
        
        return await Promise.allSettled(preloadPromises);
    }
}

// Инициализация после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Ждем пока все элементы будут готовы
    setTimeout(() => {
        ContentLoader.init();
        
        // Предзагружаем основные страницы для быстрых переходов
        ContentLoader.preloadContent([
            'partials/main.html',
            'partials/project.html',
            'partials/contacts.html',
            'partials/core/1_intro.html'
        ]);
    }, 100);
});

// Экспорт для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentLoader;
} else if (typeof window !== 'undefined') {
    window.ContentLoader = ContentLoader;
}