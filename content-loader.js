class ContentLoader {
    static currentPage = null;
    static isLoading = false;
    static animationDuration = 600;
    static randomMode = false;
    
    static animationTypes = {
        FADE: 'fade',
        SLIDE_LEFT: 'slide-left',
        SLIDE_RIGHT: 'slide-right',
        SLIDE_UP: 'slide-up',
        SLIDE_DOWN: 'slide-down',
        SCALE: 'scale',
        FLIP: 'flip',
        ROTATE: 'rotate',
        ZOOM_IN: 'zoom-in',
        ZOOM_OUT: 'zoom-out',
        BLUR: 'blur',
        ELASTIC: 'elastic',
        BOUNCE: 'bounce'
    };
    
    static currentAnimation = this.animationTypes.FADE;
    
    static async loadContent(url, animationType = null) {
        // Предотвращаем множественные одновременные загрузки
        if (this.isLoading) {
            console.warn('Загрузка уже выполняется, пропускаем запрос');
            return;
        }
        
        const container = document.getElementById('content-container');
        if (!container) {
            console.error('Контейнер контента не найден');
            return;
        }

        this.isLoading = true;
        
        // Используем переданный тип анимации, режим random или текущий
        let animation;
        if (animationType) {
            animation = animationType;
        } else if (this.randomMode) {
            animation = this.getRandomAnimation();
        } else {
            animation = this.currentAnimation;
        }
        
        // Добавляем CSS стили для анимаций если их еще нет
        this.injectAnimationStyles();
        
        try {
            // Анимация исчезновения текущего контента
            await this.animateOut(container, animation);
            
            // Показываем индикатор загрузки
            this.showLoadingIndicator(container);

            // Получаем правильный URL
            const normalizedUrl = this.normalizeUrl(url);
            console.log('Загружаем:', normalizedUrl);
            
            const response = await fetch(normalizedUrl);
            
            if (!response.ok) {
                throw new Error(`Страница не найдена (${response.status}: ${response.statusText})`);
            }
            
            const html = await response.text();
            
            // Проверяем, что контент не пустой
            if (!html.trim()) {
                throw new Error('Получен пустой контент');
            }
            
            // Устанавливаем контент
            container.innerHTML = html;
            
            // Анимация появления нового контента
            await this.animateIn(container, animation);
            
            // Обновляем активную кнопку
            this.updateActiveButton(url);
            
            // Обновляем URL в адресной строке
            this.updateBrowserUrl(url);
            
            // Прокрутка вверх
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Сохраняем текущую страницу
            this.currentPage = url;
            
            console.log('Контент успешно загружен:', url);
            
        } catch (error) {
            console.error('Ошибка загрузки контента:', error);
            this.showErrorMessage(container, error, url);
        } finally {
            this.isLoading = false;
        }
    }
    
    // Нормализация URL для разных окружений
    static normalizeUrl(url) {
        // Убираем начальные слэши
        let normalizedUrl = url.replace(/^\/+/, '');
        
        // Проверяем относительный путь от текущей страницы
        if (!normalizedUrl.startsWith('http') && !normalizedUrl.startsWith('/')) {
            // Для локальных файлов просто возвращаем как есть
            return normalizedUrl;
        }
        
        return normalizedUrl;
    }
    
    // Показать индикатор загрузки
    static showLoadingIndicator(container) {
        container.innerHTML = `
            <div class="loading-indicator">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Загрузка контента...</p>
            </div>
        `;
    }
    
    // Показать сообщение об ошибке
    static showErrorMessage(container, error, url) {
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить страницу: ${error.message}</p>
                <p><strong>URL:</strong> ${url}</p>
                <div style="margin-top: 20px;">
                    <button class="retry-btn" onclick="ContentLoader.loadContent('${url}')">
                        <i class="fas fa-sync-alt"></i> Попробовать снова
                    </button>
                    <button class="home-btn" onclick="ContentLoader.loadContent('partials/main.html')">
                        <i class="fas fa-home"></i> На главную
                    </button>
                </div>
            </div>
        `;
    }
    
    // Обновление URL в браузере
    static updateBrowserUrl(url) {
        try {
            const pageParam = url.replace('partials/', '').replace('.html', '');
            const newUrl = `${window.location.pathname}?page=${encodeURIComponent(pageParam)}`;
            history.pushState({ page: pageParam }, '', newUrl);
        } catch (error) {
            console.warn('Не удалось обновить URL браузера:', error);
        }
    }
    
    // Анимация исчезновения контента
    static async animateOut(container, animationType) {
        return new Promise((resolve) => {
            if (!container) {
                resolve();
                return;
            }
            
            container.classList.add('content-transition');
            
            switch (animationType) {
                case this.animationTypes.FADE:
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SLIDE_LEFT:
                    container.style.transform = 'translateX(-100%)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SLIDE_RIGHT:
                    container.style.transform = 'translateX(100%)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SLIDE_UP:
                    container.style.transform = 'translateY(-100%)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SLIDE_DOWN:
                    container.style.transform = 'translateY(100%)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SCALE:
                    container.style.transform = 'scale(0.8)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.FLIP:
                    container.style.transform = 'rotateY(90deg)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.ROTATE:
                    container.style.transform = 'rotate(180deg) scale(0.8)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.ZOOM_IN:
                    container.style.transform = 'scale(1.5)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.ZOOM_OUT:
                    container.style.transform = 'scale(0.3)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.BLUR:
                    container.style.filter = 'blur(20px)';
                    container.style.transform = 'scale(0.9)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.ELASTIC:
                    container.style.transform = 'scale(0.1) rotate(45deg)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.BOUNCE:
                    container.style.transform = 'translateY(-100px) scale(0.8)';
                    container.style.opacity = '0';
                    break;
                default:
                    container.style.opacity = '0';
            }
            
            setTimeout(resolve, this.animationDuration / 2);
        });
    }
    
    // Анимация появления контента
    static async animateIn(container, animationType) {
        return new Promise((resolve) => {
            if (!container) {
                resolve();
                return;
            }
            
            // Сначала устанавливаем начальное состояние
            switch (animationType) {
                case this.animationTypes.FADE:
                    container.style.opacity = '0';
                    container.style.transform = 'none';
                    break;
                case this.animationTypes.SLIDE_LEFT:
                    container.style.transform = 'translateX(100%)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SLIDE_RIGHT:
                    container.style.transform = 'translateX(-100%)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SLIDE_UP:
                    container.style.transform = 'translateY(100%)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SLIDE_DOWN:
                    container.style.transform = 'translateY(-100%)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.SCALE:
                    container.style.transform = 'scale(1.2)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.FLIP:
                    container.style.transform = 'rotateY(-90deg)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.ROTATE:
                    container.style.transform = 'rotate(-180deg) scale(1.2)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.ZOOM_IN:
                    container.style.transform = 'scale(0.3)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.ZOOM_OUT:
                    container.style.transform = 'scale(1.5)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.BLUR:
                    container.style.filter = 'blur(20px)';
                    container.style.transform = 'scale(1.1)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.ELASTIC:
                    container.style.transform = 'scale(1.8) rotate(-45deg)';
                    container.style.opacity = '0';
                    break;
                case this.animationTypes.BOUNCE:
                    container.style.transform = 'translateY(100px) scale(1.2)';
                    container.style.opacity = '0';
                    break;
                default:
                    container.style.opacity = '0';
                    container.style.transform = 'none';
            }
            
            // Небольшая задержка для применения начальных стилей
            setTimeout(() => {
                // Анимируем к финальному состоянию
                container.style.opacity = '1';
                container.style.transform = 'none';
                container.style.filter = 'none';
                
                setTimeout(() => {
                    container.classList.remove('content-transition');
                    // Очищаем inline стили
                    container.style.removeProperty('opacity');
                    container.style.removeProperty('transform');
                    container.style.removeProperty('filter');
                    resolve();
                }, this.animationDuration / 2);
            }, 50);
        });
    }
    
    // Внедрение стилей для анимаций
    static injectAnimationStyles() {
        if (document.getElementById('content-loader-styles')) {
            return; // Стили уже добавлены
        }
        
        const style = document.createElement('style');
        style.id = 'content-loader-styles';
        style.textContent = `
            .content-transition {
                transition: all ${this.animationDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
            }
            
            .content-transition * {
                transition: none !important;
            }
            
            #content-container {
                transform-origin: center;
                backface-visibility: hidden;
                perspective: 1000px;
                will-change: transform, opacity, filter;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    static setAnimationType(type) {
        if (Object.values(this.animationTypes).includes(type)) {
            this.currentAnimation = type;
            this.randomMode = false;
            console.log(`Тип анимации изменен на: ${type}`);
            return true;
        } else {
            console.warn(`Неизвестный тип анимации: ${type}`);
            return false;
        }
    }
    
    static getRandomAnimation() {
        const animations = Object.values(this.animationTypes);
        return animations[Math.floor(Math.random() * animations.length)];
    }

    static updateActiveButton(url) {
        try {
            document.querySelectorAll('.sidebar-nav a').forEach(link => {
                const isActive = link.getAttribute('href') === url;
                link.classList.toggle('active', isActive);
            });
        } catch (error) {
            console.warn('Ошибка при обновлении активной кнопки:', error);
        }
    }

    static initAccordions() {
        const accordionButtons = document.querySelectorAll('.codex-btn');
        
        accordionButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const section = this.parentElement;
                if (!section) return;
                
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
        
        console.log('Аккордеоны инициализированы:', accordionButtons.length);
    }

    static initNavigation() {
        // Удаляем старые обработчики событий
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.removeEventListener('click', this.navClickHandler);
        });
        
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', this.navClickHandler.bind(this));
        });
        
        console.log('Навигация инициализирована:', navLinks.length, 'ссылок');
    }
    
    static navClickHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        if (!href || href === '#') {
            console.warn('Ссылка без href или с #:', link);
            return;
        }
        
        // Проверяем, что ссылка не является активной (чтобы избежать лишних перезагрузок)
        if (link.classList.contains('active') && this.currentPage === href) {
            console.log('Ссылка уже активна, пропускаем');
            return;
        }
        
        console.log('Клик по навигации:', href);
        
        // Определяем тип анимации в зависимости от секции
        let animationType = this.getAnimationForSection(href);
        
        this.loadContent(href, animationType);
    }
    
    static getAnimationForSection(url) {
        if (url.includes('core/')) {
            return this.animationTypes.SLIDE_RIGHT;
        } else if (url.includes('heroes/')) {
            return this.animationTypes.ELASTIC;
        } else if (url.includes('mortals/')) {
            return this.animationTypes.ZOOM_IN;
        } else if (url.includes('dust/')) {
            return this.animationTypes.BLUR;
        } else if (url.includes('main.html')) {
            return this.animationTypes.BOUNCE;
        } else if (url.includes('project.html')) {
            return this.animationTypes.FLIP;
        } else if (url.includes('contacts.html')) {
            return this.animationTypes.ZOOM_OUT;
        } else {
            return this.animationTypes.FADE;
        }
    }
    
    static enableRandomAnimations() {
        this.randomMode = true;
        console.log('Включен режим случайных анимаций');
    }
    
    static disableRandomAnimations() {
        this.randomMode = false;
        console.log('Выключен режим случайных анимаций');
    }
    
    static createAnimationControls() {
        if (document.getElementById('animation-controls')) {
            return;
        }
        
        const controlPanel = document.createElement('div');
        controlPanel.id = 'animation-controls';
        controlPanel.innerHTML = `
            <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 10px; z-index: 1000; font-size: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h4 style="margin-bottom: 10px; color: #3498db;">🎬 Анимации</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                    <button data-animation="fade" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">Fade</button>
                    <button data-animation="slide-left" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Slide</button>
                    <button data-animation="scale" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">Scale</button>
                    <button data-animation="flip" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer;">Flip</button>
                    <button data-animation="blur" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #9b59b6; color: white; border: none; border-radius: 4px; cursor: pointer;">Blur</button>
                    <button data-animation="elastic" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #1abc9c; color: white; border: none; border-radius: 4px; cursor: pointer;">Elastic</button>
                    <button data-animation="bounce" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer;">Bounce</button>
                    <button data-animation="random" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #34495e; color: white; border: none; border-radius: 4px; cursor: pointer;">Random</button>
                </div>
                <button id="close-controls" style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: #ccc; cursor: pointer; font-size: 16px;">×</button>
            </div>
        `;
        
        document.body.appendChild(controlPanel);
        
        const buttons = controlPanel.querySelectorAll('button[data-animation]');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const animationType = e.target.dataset.animation;
                if (animationType === 'random') {
                    this.enableRandomAnimations();
                } else {
                    this.setAnimationType(animationType);
                }
            });
        });
        
        const closeBtn = controlPanel.querySelector('#close-controls');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                controlPanel.style.display = 'none';
            });
        }
    }

    static init() {
        try {
            console.log('Инициализация ContentLoader...');
            console.log('DOM ready state:', document.readyState);
            
            this.injectAnimationStyles();
            this.initAccordions();
            this.initNavigation();
            this.createAnimationControls();

            // Обработчик для кнопки "Назад" браузера
            window.addEventListener('popstate', (event) => {
                console.log('Событие popstate:', event.state);
                if (event.state && event.state.page) {
                    const url = `partials/${event.state.page}.html`;
                    this.loadContent(url);
                } else {
                    this.loadContent('partials/main.html');
                }
            });

            // Определяем начальную страницу
            const urlParams = new URLSearchParams(window.location.search);
            const page = urlParams.get('page') || 'main';
            const initialUrl = `partials/${page}.html`;
            
            // Устанавливаем начальное состояние истории
            if (!history.state) {
                history.replaceState({ page: page }, '', window.location.href);
            }
            
            // Загружаем начальную страницу
            this.loadContent(initialUrl);
            
            // Инициализируем клавиатурные сокращения
            this.initKeyboardShortcuts();
            
            console.log('ContentLoader успешно инициализирован');
            
        } catch (error) {
            console.error('Ошибка при инициализации ContentLoader:', error);
        }
    }
    
    static initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && !e.shiftKey && !e.altKey) {
                switch(e.key) {
                    case '1':
                        this.setAnimationType(this.animationTypes.FADE);
                        e.preventDefault();
                        break;
                    case '2':
                        this.setAnimationType(this.animationTypes.SLIDE_LEFT);
                        e.preventDefault();
                        break;
                    case '3':
                        this.setAnimationType(this.animationTypes.SCALE);
                        e.preventDefault();
                        break;
                    case '0':
                        this.enableRandomAnimations();
                        e.preventDefault();
                        break;
                }
            }
        });
        
        console.log('Клавиатурные сокращения инициализированы');
    }

    static reload() {
        if (this.currentPage) {
            console.log('Перезагрузка текущей страницы:', this.currentPage);
            this.loadContent(this.currentPage);
        } else {
            console.log('Загрузка главной страницы');
            this.loadContent('partials/main.html');
        }
    }
    
    static debug() {
        console.log('=== DEBUG ContentLoader ===');
        console.log('Текущая страница:', this.currentPage);
        console.log('Загрузка:', this.isLoading);
        console.log('Текущая анимация:', this.currentAnimation);
        console.log('Режим random:', this.randomMode);
        console.log('Количество навигационных ссылок:', document.querySelectorAll('.sidebar-nav a').length);
        console.log('Количество аккордеонов:', document.querySelectorAll('.codex-btn').length);
    }
}

// Инициализация при готовности DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM готов, инициализируем ContentLoader...');
    ContentLoader.init();
});

// Дополнительная проверка на случай, если DOM уже готов
if (document.readyState !== 'loading') {
    console.log('DOM уже готов, запускаем инициализацию ContentLoader');
    setTimeout(() => {
        ContentLoader.init();
    }, 100);
}

// Экспортируем в глобальную область видимости
if (typeof window !== 'undefined') {
    window.ContentLoader = ContentLoader;
}