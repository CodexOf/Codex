class ContentLoader {
    static currentPage = null;
    static isTransitioning = false;
    static isInitialized = false;
    static animationDuration = {
        exit: 300,
        enter: 400,
        loading: 150
    };
    static preloadedContent = new Map();
    static animationPrepared = false;
    
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
            // Подготавливаем анимации заранее если еще не подготовлены
            if (!this.animationPrepared) {
                this.prepareAnimations();
                this.animationPrepared = true;
            }
            
            // Оптимизация производительности
            container.style.willChange = 'opacity, transform';
            
            // Используем CSS классы вместо inline стилей для лучшей производительности
            container.classList.add('content-exiting');
            
            // Принудительный reflow для гарантии плавности
            container.offsetHeight;
            
            // Запускаем анимацию выхода
            requestAnimationFrame(() => {
                container.classList.remove('content-exiting');
                container.classList.add('content-exited');
                
                // Завершаем анимацию
                setTimeout(() => {
                    container.style.willChange = 'auto';
                    resolve();
                }, this.animationDuration.exit);
            });
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
        container.style.transform = 'translate3d(0, 0, 0)';
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
            
            // Оптимизация производительности
            container.style.willChange = 'opacity, transform';
            
            // Подготавливаем для анимации входа
            container.classList.remove('content-exited');
            container.classList.add('content-entering');
            
            // Принудительный reflow
            container.offsetHeight;
            
            // Небольшая задержка для плавности
            setTimeout(() => {
                // Запускаем анимацию входа
                requestAnimationFrame(() => {
                    container.classList.remove('content-entering');
                    container.classList.add('content-entered');
                    
                    // Завершаем анимацию
                    setTimeout(() => {
                        container.classList.remove('content-entered');
                        container.style.willChange = 'auto';
                        resolve();
                    }, this.animationDuration.enter);
                });
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
            container.style.transform = 'translate3d(0, 0, 0)';
            container.style.transition = `opacity ${this.animationDuration.enter}ms ease-out`;
            
            requestAnimationFrame(() => {
                container.style.opacity = '1';
                setTimeout(resolve, this.animationDuration.enter);
            });
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
        // Подготавливаем анимации сразу
        this.prepareAnimations();
        this.animationPrepared = true;
        
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
    
    // Метод для предварительной подготовки анимаций
    static prepareAnimations() {
        // Создаем невидимый элемент для "прогрева" CSS анимаций
        const testElement = document.createElement('div');
        testElement.style.cssText = `
            position: fixed;
            top: -9999px;
            left: -9999px;
            width: 1px;
            height: 1px;
            opacity: 0;
            pointer-events: none;
            will-change: opacity, transform;
        `;
        document.body.appendChild(testElement);
        
        // Принудительно запускаем все анимации для их "прогрева"
        const animationClasses = ['content-exiting', 'content-exited', 'content-entering', 'content-entered'];
        
        animationClasses.forEach((className, index) => {
            setTimeout(() => {
                testElement.classList.add(className);
                // Принудительный reflow
                testElement.offsetHeight;
                testElement.classList.remove(className);
            }, index * 10);
        });
        
        // Очищаем тестовый элемент через некоторое время
        setTimeout(() => {
            if (testElement.parentNode) {
                testElement.parentNode.removeChild(testElement);
            }
        }, 100);
        
        // Подготавливаем контейнер контента для анимаций
        const container = document.getElementById('content-container');
        if (container) {
            container.style.backfaceVisibility = 'hidden';
            container.style.perspective = '1000px';
            container.style.transformStyle = 'preserve-3d';
        }
    }
}

// Инициализация после полной загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Подготавливаем анимации как можно раньше
    ContentLoader.prepareAnimations();
    
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