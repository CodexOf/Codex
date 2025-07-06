class ContentLoader {
    static currentPage = null;
    static isLoading = false;
    static animationDuration = 600; // Длительность анимации в миллисекундах
    
    // Типы анимаций переходов
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
            return;
        }
        
        const container = document.getElementById('content-container');
        if (!container) {
            console.error('Контейнер контента не найден');
            return;
        }

        this.isLoading = true;
        
        // Используем переданный тип анимации или текущий
        const animation = animationType || this.currentAnimation;
        
        // Добавляем CSS стили для анимаций если их еще нет
        this.injectAnimationStyles();
        
        try {
            // Анимация исчезновения текущего контента
            await this.animateOut(container, animation);
            
            // Показываем индикатор загрузки
            container.innerHTML = `
                <div class="loading-indicator">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Загрузка...</p>
                </div>
            `;

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
            
            // Устанавливаем контент
            container.innerHTML = html;
            
            // Анимация появления нового контента
            await this.animateIn(container, animation);
            
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
            await this.animateIn(container, this.animationTypes.FADE);
        } finally {
            this.isLoading = false;
        }
    }
    
    // Анимация исчезновения контента
    static async animateOut(container, animationType) {
        return new Promise((resolve) => {
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
            
            /* Дополнительные стили для плавности */
            #content-container {
                transform-origin: center;
                backface-visibility: hidden;
                perspective: 1000px;
                will-change: transform, opacity, filter;
            }
            
            /* Стили для индикатора загрузки */
            .loading-indicator {
                animation: fadeInScale 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            @keyframes fadeInScale {
                0% {
                    opacity: 0;
                    transform: scale(0.8) translateY(20px);
                }
                50% {
                    opacity: 0.7;
                    transform: scale(1.05) translateY(-5px);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }
            
            /* Анимация для кнопок навигации */
            .nav-btn {
                transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                position: relative;
                overflow: hidden;
            }
            
            .nav-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                transition: left 0.6s ease;
            }
            
            .nav-btn:hover {
                transform: translateX(8px) scale(1.02);
                box-shadow: 0 6px 20px rgba(52, 152, 219, 0.2);
            }
            
            .nav-btn:hover::before {
                left: 100%;
            }
            
            .nav-btn.active {
                transform: translateX(12px);
                box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
                background: linear-gradient(135deg, #1e3a57 0%, #2c5aa0 100%);
            }
            
            /* Анимация для аккордеонов */
            .codex-btn {
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            .codex-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            
            .codex-content {
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                transform-origin: top;
            }
            
            .codex-section:not(.active) .codex-content {
                transform: scaleY(0);
                opacity: 0;
            }
            
            .codex-section.active .codex-content {
                transform: scaleY(1);
                opacity: 1;
            }
            
            /* Эффекты для специальных анимаций */
            @keyframes elasticBounce {
                0% { transform: scale(0.1) rotate(45deg); }
                50% { transform: scale(1.2) rotate(0deg); }
                70% { transform: scale(0.9) rotate(-5deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            
            @keyframes bounceIn {
                0% { transform: translateY(-100px) scale(0.8); }
                60% { transform: translateY(10px) scale(1.1); }
                80% { transform: translateY(-5px) scale(0.95); }
                100% { transform: translateY(0) scale(1); }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Установка типа анимации
    static setAnimationType(type) {
        if (Object.values(this.animationTypes).includes(type)) {
            this.currentAnimation = type;
            console.log(`Тип анимации изменен на: ${type}`);
        } else {
            console.warn(`Неизвестный тип анимации: ${type}`);
        }
    }
    
    // Случайная анимация
    static getRandomAnimation() {
        const animations = Object.values(this.animationTypes);
        return animations[Math.floor(Math.random() * animations.length)];
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
                
                // Определяем тип анимации в зависимости от секции
                let animationType = this.getAnimationForSection(href);
                
                this.loadContent(href, animationType);
            });
        });
    }
    
    // Определение типа анимации для разных секций
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
            return this.animationTypes.SLIDE_LEFT;
        }
    }
    
    // Методы для быстрого переключения анимаций
    static enableFadeAnimation() {
        this.setAnimationType(this.animationTypes.FADE);
    }
    
    static enableSlideAnimations() {
        this.setAnimationType(this.animationTypes.SLIDE_LEFT);
    }
    
    static enableScaleAnimation() {
        this.setAnimationType(this.animationTypes.SCALE);
    }
    
    static enableRandomAnimations() {
        // Каждый переход будет случайным
        this.randomMode = true;
        console.log('Включен режим случайных анимаций');
    }
    
    static disableRandomAnimations() {
        this.randomMode = false;
        console.log('Выключен режим случайных анимаций');
    }
    
    // Показать уведомление о смене анимации
    static showAnimationFeedback(animationType) {
        const existingNotification = document.querySelector('.animation-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'animation-notification';
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 10px;
            background: rgba(52, 152, 219, 0.95);
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        const animationName = animationType === 'random' ? 'Случайные анимации' : animationType.charAt(0).toUpperCase() + animationType.slice(1);
        notification.textContent = `Анимация: ${animationName}`;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Автоматическое скрытие через 2 секунды
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
    
    // Создание панели управления анимациями (опционально)
    static createAnimationControls() {
        const controlPanel = document.createElement('div');
        controlPanel.id = 'animation-controls';
        controlPanel.innerHTML = `
            <div style="position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.9); color: white; padding: 15px; border-radius: 10px; z-index: 1000; font-size: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); backdrop-filter: blur(10px);">
                <h4 style="margin-bottom: 10px; color: #3498db;">🎬 Анимации</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                    <button data-animation="fade" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Fade</button>
                    <button data-animation="slide-left" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Slide</button>
                    <button data-animation="scale" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Scale</button>
                    <button data-animation="flip" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Flip</button>
                    <button data-animation="blur" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #9b59b6; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Blur</button>
                    <button data-animation="elastic" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #1abc9c; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Elastic</button>
                    <button data-animation="bounce" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Bounce</button>
                    <button data-animation="random" style="margin: 2px; padding: 6px 8px; font-size: 10px; background: #34495e; color: white; border: none; border-radius: 4px; cursor: pointer; transition: all 0.2s;">Random</button>
                </div>
                <button id="close-controls" style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: #ccc; cursor: pointer; font-size: 16px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">×</button>
            </div>
        `;
        
        document.body.appendChild(controlPanel);
        
        // Добавляем обработчики событий для кнопок
        const buttons = controlPanel.querySelectorAll('button[data-animation]');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const animationType = e.target.dataset.animation;
                if (animationType === 'random') {
                    this.enableRandomAnimations();
                } else {
                    this.setAnimationType(animationType);
                }
                // Визуальная обратная связь
                this.showAnimationFeedback(animationType);
            });
        });
        
        // Обработчик для кнопки закрытия
        const closeBtn = controlPanel.querySelector('#close-controls');
        closeBtn.addEventListener('click', () => {
            controlPanel.style.display = 'none';
        });
        
        // Добавляем стили для hover эффектов кнопок
        const style = document.createElement('style');
        style.textContent = `
            #animation-controls button:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            #animation-controls button:active {
                transform: translateY(0) scale(0.95);
            }
        `;
        document.head.appendChild(style);
    }

    static init() {
        // Инициализация аккордеонов
        this.initAccordions();
        
        // Инициализация навигации
        this.initNavigation();
        
        // Добавляем стили для анимаций
        this.injectAnimationStyles();
        
        // Создаем панель управления анимациями (раскомментируйте если нужно)
        this.createAnimationControls();

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
        
        // Добавляем слушатели для клавиатурных сокращений
        this.initKeyboardShortcuts();
    }
    
    // Клавиатурные сокращения для анимаций
    static initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + цифра для переключения анимаций
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
                    case '4':
                        this.setAnimationType(this.animationTypes.FLIP);
                        e.preventDefault();
                        break;
                    case '5':
                        this.setAnimationType(this.animationTypes.ROTATE);
                        e.preventDefault();
                        break;
                    case '0':
                        this.enableRandomAnimations();
                        e.preventDefault();
                        break;
                }
            }
        });
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