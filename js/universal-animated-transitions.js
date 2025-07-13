/**
 * Универсальная система анимированных переходов между страницами
 * Поддерживает переходы между index.html, content.html, calendar.html, auth.html
 * с плавными анимациями затемнения и появления
 */

class UniversalAnimatedTransitions {
    constructor() {
        this.isTransitioning = false;
        this.transitionDuration = 1200;
        this.overlay = null;
        this.currentPage = this.detectCurrentPage();
        this.authManager = window.authManager || null;
        
        console.log(`🎨 Инициализация анимаций для страницы: ${this.currentPage}`);
        this.init();
    }

    /**
     * Определяет текущую страницу
     */
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename === '' || filename === 'index.html') return 'index';
        if (filename === 'content.html') return 'content';
        if (filename === 'calendar.html') return 'calendar';
        if (filename === 'auth.html') return 'auth';
        
        return 'other';
    }

    /**
     * Инициализация системы
     */
    init() {
        try {
            this.createTransitionOverlay();
            this.setupPageSpecificHandlers();
            this.handlePageEntrance();
            this.addTransitionStyles();
            console.log('✅ Универсальная система анимаций готова');
        } catch (error) {
            console.error('❌ Ошибка инициализации анимаций:', error);
        }
    }

    /**
     * Создание оверлея для анимаций
     */
    createTransitionOverlay() {
        if (this.overlay || document.getElementById('universalAnimationOverlay')) return;
        
        this.overlay = document.createElement('div');
        this.overlay.id = 'universalAnimationOverlay';
        this.overlay.className = 'universal-transition-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 999999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            transform: translate3d(0, 0, 0);
        `;
        
        document.body.appendChild(this.overlay);
        console.log('📱 Оверлей для анимаций создан');
    }

    /**
     * Добавление стилей для анимаций
     */
    addTransitionStyles() {
        if (document.getElementById('universalTransitionStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'universalTransitionStyles';
        style.textContent = `
            .universal-transition-overlay.active {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            body.transitioning {
                overflow: hidden !important;
            }
            
            .fade-out-animation {
                animation: universalFadeOut 0.5s ease-out forwards !important;
            }
            
            .slide-out-animation {
                animation: universalSlideOut 0.6s ease-out forwards !important;
            }
            
            .scale-out-animation {
                animation: universalScaleOut 0.7s ease-out forwards !important;
            }
            
            @keyframes universalFadeOut {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-20px);
                }
            }
            
            @keyframes universalSlideOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-30px);
                }
            }
            
            @keyframes universalScaleOut {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.95);
                }
            }
            
            /* Исключения для интерактивных элементов */
            .auth-container,
            .auth-container *,
            .form-input,
            .form-button,
            .auth-tab {
                pointer-events: auto !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Настройка обработчиков для конкретной страницы
     */
    setupPageSpecificHandlers() {
        switch (this.currentPage) {
            case 'index':
                this.setupIndexPageHandlers();
                break;
            case 'content':
                this.setupContentPageHandlers();
                break;
            case 'calendar':
                this.setupCalendarPageHandlers();
                break;
            case 'auth':
                this.setupAuthPageHandlers();
                break;
        }
    }

    /**
     * Обработчики для главной страницы (index.html)
     */
    setupIndexPageHandlers() {
        console.log('🏠 Настройка обработчиков для главной страницы');
        
        // Кнопка "Начать приключение"
        const startButton = document.querySelector('.start-button:not(.calendar-button)');
        if (startButton) {
            this.addTransitionHandler(startButton, 'content.html?from=index', 'main-to-content');
        }
        
        // Кнопка календаря
        const calendarButton = document.querySelector('.start-button.calendar-button');
        if (calendarButton) {
            this.addTransitionHandler(calendarButton, null, 'main-to-calendar', () => {
                return this.isAuthenticated() ? 'calendar.html' : 'auth.html?returnTo=calendar';
            });
        }
    }

    /**
     * Обработчики для страницы контента (content.html)
     */
    setupContentPageHandlers() {
        console.log('📖 Настройка обработчиков для страницы контента');
        
        // Виджет календаря
        const calendarWidget = document.getElementById('calendarWidget');
        if (calendarWidget) {
            this.addTransitionHandler(calendarWidget, null, 'content-to-calendar', () => {
                return this.isAuthenticated() ? 'calendar.html' : 'auth.html?returnTo=calendar';
            });
        }
        
        // Навигационные ссылки в сайдбаре (опционально)
        this.setupSidebarNavigation();
    }

    /**
     * Обработчики для страницы календаря (calendar.html)
     */
    setupCalendarPageHandlers() {
        console.log('📅 Настройка обработчиков для страницы календаря');
        
        // Кнопка "Назад к содержимому"
        const backButton = document.querySelector('.back-btn[href="content.html"]');
        if (backButton) {
            this.addTransitionHandler(backButton, 'content.html', 'calendar-to-content');
        }
        
        // Виджет контента
        const contentWidget = document.getElementById('contentWidget');
        if (contentWidget) {
            this.addTransitionHandler(contentWidget, 'content.html', 'calendar-to-content');
        }
        
        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            this.addTransitionHandler(logoutBtn, 'index.html', 'logout', () => {
                if (this.authManager) {
                    this.authManager.logout();
                }
                return 'index.html';
            });
        }
    }

    /**
     * Обработчики для страницы авторизации (auth.html)
     */
    setupAuthPageHandlers() {
        console.log('🔐 Настройка обработчиков для страницы авторизации');
        
        // Кнопка "Вернуться на сайт"
        const backToSite = document.querySelector('.back-to-site');
        if (backToSite) {
            this.addTransitionHandler(backToSite, 'index.html', 'auth-to-main');
        }
        
        // Перехваты форм авторизации будут обрабатываться отдельно
        this.setupAuthFormHandlers();
    }

    /**
     * Настройка обработчиков форм авторизации
     */
    setupAuthFormHandlers() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                // Позволяем форме обработаться, переход будет в auth.js
                console.log('📝 Обработка формы входа');
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                // Позволяем форме обработаться, переход будет в auth.js
                console.log('📝 Обработка формы регистрации');
            });
        }
    }

    /**
     * Настройка навигации в сайдбаре (опционально)
     */
    setupSidebarNavigation() {
        const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-btn');
        sidebarLinks.forEach(link => {
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('partials/')) {
                // Эти ссылки загружают контент динамически, не добавляем переходы
                return;
            }
        });
    }

    /**
     * Добавляет обработчик анимированного перехода к элементу
     */
    addTransitionHandler(element, targetUrl, transitionType, urlResolver = null) {
        if (!element) return;
        
        // Удаляем старые обработчики
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        
        newElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.isTransitioning) return;
            
            // Определяем URL
            let finalUrl = targetUrl;
            if (urlResolver) {
                finalUrl = urlResolver();
            }
            if (!finalUrl && newElement.getAttribute('href')) {
                finalUrl = newElement.getAttribute('href');
            }
            
            if (!finalUrl) {
                console.error('❌ Не удалось определить URL для перехода');
                return;
            }
            
            console.log(`🎬 Анимированный переход: ${transitionType} -> ${finalUrl}`);
            this.performTransition(finalUrl, transitionType);
        });
        
        console.log(`✅ Обработчик добавлен для ${transitionType}`);
    }

    /**
     * Выполняет анимированный переход
     */
    performTransition(targetUrl, transitionType = 'default') {
        if (this.isTransitioning) {
            console.warn('⚠️ Переход уже выполняется');
            return;
        }

        console.log(`🎬 Начинаем переход: ${transitionType} -> ${targetUrl}`);
        this.isTransitioning = true;
        document.body.classList.add('transitioning');

        try {
            // Фаза 1: Анимация исчезновения элементов страницы
            this.animatePageExit(transitionType);

            // Фаза 2: Появление черного оверлея
            setTimeout(() => {
                this.overlay.classList.add('active');
            }, 400);

            // Фаза 3: Переход на новую страницу
            setTimeout(() => {
                this.navigateToPage(targetUrl, transitionType);
            }, this.transitionDuration);

        } catch (error) {
            console.error('❌ Ошибка во время анимации:', error);
            this.fallbackTransition(targetUrl);
        }
    }

    /**
     * Анимация исчезновения элементов текущей страницы
     */
    animatePageExit(transitionType) {
        console.log(`🌟 Анимация исчезновения: ${transitionType}`);
        
        const animations = this.getExitAnimations(transitionType);
        
        animations.forEach(({ selector, animationClass, delay = 0 }) => {
            setTimeout(() => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.classList.add(animationClass);
                });
            }, delay);
        });
    }

    /**
     * Возвращает анимации для различных типов переходов
     */
    getExitAnimations(transitionType) {
        const animations = {
            'main-to-content': [
                { selector: '.game-title, .game-subtitle', animationClass: 'fade-out-animation', delay: 0 },
                { selector: '.start-button', animationClass: 'slide-out-animation', delay: 100 },
                { selector: '.main-footer', animationClass: 'fade-out-animation', delay: 200 },
                { selector: '.welcome-screen', animationClass: 'scale-out-animation', delay: 300 }
            ],
            'main-to-calendar': [
                { selector: '.game-title, .game-subtitle', animationClass: 'fade-out-animation', delay: 0 },
                { selector: '.start-button', animationClass: 'slide-out-animation', delay: 100 },
                { selector: '.main-footer', animationClass: 'fade-out-animation', delay: 200 }
            ],
            'content-to-calendar': [
                { selector: '.sidebar', animationClass: 'slide-out-animation', delay: 0 },
                { selector: '.main-content', animationClass: 'fade-out-animation', delay: 100 },
                { selector: '.calendar-widget', animationClass: 'scale-out-animation', delay: 200 }
            ],
            'calendar-to-content': [
                { selector: '.calendar-header', animationClass: 'fade-out-animation', delay: 0 },
                { selector: '.calendar-controls', animationClass: 'slide-out-animation', delay: 100 },
                { selector: '.calendar-grid, .events-list-section', animationClass: 'fade-out-animation', delay: 150 },
                { selector: '.content-widget', animationClass: 'scale-out-animation', delay: 200 }
            ],
            'auth-to-main': [
                { selector: '.auth-container', animationClass: 'scale-out-animation', delay: 0 },
                { selector: '.decorative-bg', animationClass: 'fade-out-animation', delay: 100 }
            ],
            'logout': [
                { selector: '.calendar-container', animationClass: 'fade-out-animation', delay: 0 },
                { selector: '.user-info', animationClass: 'slide-out-animation', delay: 100 }
            ]
        };
        
        return animations[transitionType] || [
            { selector: 'main, .container, .calendar-container, .auth-container', animationClass: 'fade-out-animation', delay: 0 }
        ];
    }

    /**
     * Обработка появления страницы
     */
    handlePageEntrance() {
        const fromTransition = sessionStorage.getItem('pageTransition');
        const transitionType = sessionStorage.getItem('transitionType');
        
        if (fromTransition) {
            console.log(`📥 Восстановление после перехода: ${transitionType}`);
            
            // Показываем черный экран
            this.overlay.classList.add('active');
            document.body.classList.add('transitioning');
            
            // Специальная обработка для перехода с index.html
            if (transitionType === 'main-to-content') {
                this.handleIndexToContentTransition();
            } else {
                this.handleGenericEntrance();
            }
            
        } else {
            // Обычная загрузка страницы
            this.handleNormalPageLoad();
        }
    }

    /**
     * Специальная обработка перехода index -> content
     */
    handleIndexToContentTransition() {
        // Скрываем содержимое
        const elementsToHide = ['.sidebar', '.main-content', '.calendar-widget'];
        elementsToHide.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) element.style.visibility = 'hidden';
        });
        
        // Постепенно показываем
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 1.5s ease-out';
            this.overlay.classList.remove('active');
            
            // Показываем содержимое
            elementsToHide.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) element.style.visibility = 'visible';
            });
            
            setTimeout(() => {
                this.completeEntrance();
            }, 1500);
        }, 500);
    }

    /**
     * Обычный вход на страницу
     */
    handleGenericEntrance() {
        setTimeout(() => {
            this.overlay.classList.remove('active');
            setTimeout(() => {
                this.completeEntrance();
            }, 800);
        }, 300);
    }

    /**
     * Обычная загрузка страницы
     */
    handleNormalPageLoad() {
        setTimeout(() => {
            this.completeEntrance();
        }, 100);
    }

    /**
     * Завершение входа на страницу
     */
    completeEntrance() {
        document.body.classList.remove('transitioning');
        document.body.classList.add('animation-complete');
        
        // Восстанавливаем скролл
        document.documentElement.style.overflow = '';
        document.body.style.overflowY = 'auto';
        
        // Очищаем состояние
        sessionStorage.removeItem('pageTransition');
        sessionStorage.removeItem('transitionType');
        
        console.log('✅ Вход на страницу завершен');
    }

    /**
     * Переход на новую страницу
     */
    navigateToPage(targetUrl, transitionType) {
        try {
            // Сохраняем информацию о переходе
            sessionStorage.setItem('pageTransition', 'true');
            sessionStorage.setItem('transitionType', transitionType);
            
            console.log(`🌐 Переход на: ${targetUrl}`);
            window.location.href = targetUrl;
            
        } catch (error) {
            console.error('❌ Ошибка при переходе:', error);
            this.fallbackTransition(targetUrl);
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Резервный переход без анимации
     */
    fallbackTransition(targetUrl) {
        console.log('🔄 Резервный переход на:', targetUrl);
        this.isTransitioning = false;
        window.location.href = targetUrl;
    }

    /**
     * Проверка авторизации
     */
    isAuthenticated() {
        if (this.authManager && typeof this.authManager.isAuthenticated === 'function') {
            return this.authManager.isAuthenticated();
        }
        
        // Fallback проверка
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        return !!(token && user);
    }

    /**
     * Метод для программного перехода с анимацией
     */
    static transitionTo(targetUrl, transitionType = 'programmatic') {
        if (window.universalAnimatedTransitions) {
            window.universalAnimatedTransitions.performTransition(targetUrl, transitionType);
        } else {
            window.location.href = targetUrl;
        }
    }

    /**
     * Информация о состоянии системы
     */
    getStatus() {
        return {
            currentPage: this.currentPage,
            isTransitioning: this.isTransitioning,
            hasOverlay: !!this.overlay,
            isAuthenticated: this.isAuthenticated()
        };
    }
}

/**
 * Функция для использования переходов из auth.js
 */
window.performAnimatedAuthTransition = function(targetUrl) {
    if (window.universalAnimatedTransitions) {
        window.universalAnimatedTransitions.performTransition(targetUrl, 'auth-success');
    } else {
        window.location.href = targetUrl;
    }
};

/**
 * Инициализация системы
 */
function initUniversalAnimatedTransitions() {
    if (window.universalAnimatedTransitions) return;
    
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    window.universalAnimatedTransitions = new UniversalAnimatedTransitions();
                }, 100);
            });
        } else {
            window.universalAnimatedTransitions = new UniversalAnimatedTransitions();
        }
    } catch (error) {
        console.error('❌ Критическая ошибка инициализации анимаций:', error);
    }
}

// Запуск инициализации
initUniversalAnimatedTransitions();

// Дополнительная инициализация для надежности
setTimeout(() => {
    if (!window.universalAnimatedTransitions) {
        window.universalAnimatedTransitions = new UniversalAnimatedTransitions();
    }
}, 500);

console.log('🎨 Универсальная система анимированных переходов загружена');
