// Объединенная система: работающие кнопки + красивые анимации
console.log('🎨 Загрузка объединенной системы навигации с анимациями...');

class WorkingNavigationWithAnimations {
    constructor() {
        this.isTransitioning = false;
        this.transitionDuration = 1200;
        this.overlay = null;
        this.init();
    }

    init() {
        console.log('🚀 Инициализация объединенной системы...');
        this.createTransitionOverlay();
        this.setupWorkingButtons();
        this.handlePageEntrance();
        console.log('✅ Объединенная система готова');
    }

    // Создание оверлея для анимаций
    createTransitionOverlay() {
        if (this.overlay) return;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'page-transition-overlay';
        this.overlay.id = 'universalTransitionOverlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 99999;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.8s ease-out;
        `;
        
        // Добавляем активное состояние
        const style = document.createElement('style');
        style.textContent = `
            .page-transition-overlay.active {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            
            body.transitioning {
                overflow: hidden !important;
            }
            
            .exit-text-animation {
                animation: exitTextFade 0.4s ease-out forwards !important;
            }
            
            .exit-background-animation {
                animation: exitBackgroundFade 0.4s ease-out forwards !important;
            }
            
            @keyframes exitTextFade {
                from {
                    opacity: 1;
                    transform: translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateY(-10px);
                }
            }
            
            @keyframes exitBackgroundFade {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(1.05);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.overlay);
        
        console.log('📱 Оверлей для анимаций создан');
    }

    // Настройка работающих кнопок
    setupWorkingButtons() {
        console.log('🔧 Настройка работающих кнопок с анимациями...');
        
        // Убираем старые обработчики
        this.removeOldHandlers();
        
        // Кнопка "Начать приключение"
        this.setupStartButton();
        
        // Кнопка "Календарь"
        this.setupCalendarButton();
        
        // Виджет календаря
        this.setupCalendarWidget();
        
        console.log('✅ Все кнопки настроены с анимациями');
    }

    removeOldHandlers() {
        const allButtons = document.querySelectorAll('a, button');
        allButtons.forEach(btn => {
            if (btn.classList.contains('start-button') || btn.id === 'calendarWidget') {
                const newBtn = btn.cloneNode(true);
                if (btn.parentNode) {
                    btn.parentNode.replaceChild(newBtn, btn);
                }
            }
        });
    }

    setupStartButton() {
        const startBtn = document.querySelector('.start-button:not(.calendar-button)');
        if (startBtn) {
            console.log('🚀 Настройка кнопки "Начать приключение" с анимацией');
            
            startBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🚀 Клик: Начать приключение с анимацией');
                
                if (this.isTransitioning) return false;
                
                this.performAnimatedTransition('content.html?from=index', 'main-page');
                return false;
            };
            
            // Дополнительный обработчик
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.isTransitioning) {
                    this.performAnimatedTransition('content.html?from=index', 'main-page');
                }
            }, true);
            
            console.log('✅ Кнопка "Начать приключение" настроена');
        }
    }

    setupCalendarButton() {
        const calendarBtn = document.querySelector('.calendar-button');
        if (calendarBtn) {
            console.log('📅 Настройка кнопки календаря с анимацией');
            
            calendarBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📅 Клик: Календарь с анимацией');
                
                if (this.isTransitioning) return false;
                
                const targetUrl = this.isAuthenticated() ? 'calendar.html' : 'auth.html?returnTo=calendar';
                this.performAnimatedTransition(targetUrl, 'calendar-page');
                return false;
            };
            
            // Дополнительный обработчик
            calendarBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.isTransitioning) {
                    const targetUrl = this.isAuthenticated() ? 'calendar.html' : 'auth.html?returnTo=calendar';
                    this.performAnimatedTransition(targetUrl, 'calendar-page');
                }
            }, true);
            
            console.log('✅ Кнопка календаря настроена');
        }
    }

    setupCalendarWidget() {
        const widget = document.getElementById('calendarWidget');
        if (widget) {
            console.log('📅 Настройка виджета календаря с анимацией');
            
            widget.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('📅 Клик: Виджет календаря с анимацией');
                
                if (this.isTransitioning) return false;
                
                const targetUrl = this.isAuthenticated() ? 'calendar.html' : 'auth.html?returnTo=calendar';
                this.performAnimatedTransition(targetUrl, 'to-calendar');
                return false;
            };
            
            console.log('✅ Виджет календаря настроен');
        }
    }

    // Проверка авторизации
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        return !!(token && user);
    }

    // Анимированный переход
    performAnimatedTransition(targetUrl, transitionType = 'default') {
        if (this.isTransitioning) {
            console.warn('⚠️ Переход уже выполняется');
            return;
        }

        if (!targetUrl) {
            console.error('❌ Отсутствует URL для перехода');
            return;
        }

        console.log(`🎨 Начинаем анимированный переход: ${transitionType} -> ${targetUrl}`);
        this.isTransitioning = true;

        // Отключаем взаимодействие
        document.body.classList.add('transitioning');

        try {
            // Фаза 1: Затемнение элементов страницы
            this.fadeOutPageElements(transitionType);

            // Фаза 2: Появление черного оверлея
            setTimeout(() => {
                this.overlay.classList.add('active');
            }, 300);

            // Фаза 3: Переход на новую страницу
            setTimeout(() => {
                this.navigateToPage(targetUrl);
            }, this.transitionDuration);

        } catch (error) {
            console.error('❌ Ошибка во время анимации:', error);
            this.fallbackTransition(targetUrl);
        }
    }

    // Затемнение элементов страницы
    fadeOutPageElements(transitionType) {
        console.log(`🌟 Затемнение элементов: ${transitionType}`);

        switch (transitionType) {
            case 'main-page':
                this.fadeOutMainPageElements();
                break;
            case 'calendar-page':
            case 'to-calendar':
                this.fadeOutGenericElements();
                break;
            default:
                this.fadeOutGenericElements();
        }
    }

    fadeOutMainPageElements() {
        const elements = [
            '.game-title',
            '.game-subtitle', 
            '.start-button',
            '.main-footer'
        ];

        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('exit-text-animation');
            }
        });

        // Затемнение фона
        setTimeout(() => {
            const welcomeScreen = document.querySelector('.welcome-screen');
            if (welcomeScreen) {
                welcomeScreen.classList.add('exit-background-animation');
            }
        }, 200);
    }

    fadeOutGenericElements() {
        const elements = [
            '.sidebar',
            '.main-content',
            '.calendar-container',
            '.calendar-widget',
            '.content-widget'
        ];

        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('exit-text-animation');
            }
        });
    }

    // Обработка появления страницы
    handlePageEntrance() {
        const fromTransition = sessionStorage.getItem('pageTransition');
        
        if (fromTransition) {
            console.log('📥 Восстановление после анимированного перехода');
            
            // Показываем черный экран
            this.overlay.classList.add('active');
            document.body.classList.add('transitioning');
            
            // Постепенно показываем содержимое
            setTimeout(() => {
                this.overlay.classList.remove('active');
                document.body.classList.remove('transitioning');
                document.body.classList.add('animation-complete');
                
                // Очищаем состояние
                sessionStorage.removeItem('pageTransition');
            }, 500);
            
        } else {
            // Обычная загрузка страницы
            setTimeout(() => {
                document.body.classList.add('animation-complete');
            }, 100);
        }
    }

    // Переход на новую страницу
    navigateToPage(targetUrl) {
        try {
            // Сохраняем информацию о переходе
            sessionStorage.setItem('pageTransition', 'true');
            
            console.log('🌐 Анимированный переход на:', targetUrl);
            window.location.href = targetUrl;
            
        } catch (error) {
            console.error('❌ Ошибка при переходе:', error);
            this.fallbackTransition(targetUrl);
        } finally {
            this.isTransitioning = false;
        }
    }

    // Резервный переход
    fallbackTransition(targetUrl) {
        console.log('🔄 Резервный переход на:', targetUrl);
        setTimeout(() => {
            window.location.href = targetUrl;
            this.isTransitioning = false;
        }, 100);
    }

    // Простой переход без анимации (для fallback)
    simpleTransition(targetUrl) {
        console.log('⚡ Простой переход на:', targetUrl);
        window.location.href = targetUrl;
    }
}

// Инициализация объединенной системы
let workingNavigation = null;

function initializeWorkingNavigation() {
    if (window.NAVIGATION_LOADED) return;
    
    console.log('🎨 Инициализация объединенной системы навигации...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                workingNavigation = new WorkingNavigationWithAnimations();
                window.NAVIGATION_LOADED = true;
            }, 100);
        });
    } else {
        setTimeout(() => {
            workingNavigation = new WorkingNavigationWithAnimations();
            window.NAVIGATION_LOADED = true;
        }, 100);
    }
}

// Запуск инициализации
initializeWorkingNavigation();

// Дополнительные запуски для надежности
setTimeout(() => {
    if (!window.NAVIGATION_LOADED) {
        workingNavigation = new WorkingNavigationWithAnimations();
        window.NAVIGATION_LOADED = true;
    }
}, 500);

setTimeout(() => {
    if (!window.NAVIGATION_LOADED) {
        workingNavigation = new WorkingNavigationWithAnimations();
        window.NAVIGATION_LOADED = true;
    }
}, 1000);

// Глобальные функции для отладки
window.testAnimatedButtons = function() {
    console.log('=== ТЕСТ АНИМИРОВАННЫХ КНОПОК ===');
    
    const startBtn = document.querySelector('.start-button:not(.calendar-button)');
    const calendarBtn = document.querySelector('.calendar-button');
    
    console.log('Кнопка "Начать приключение":', startBtn);
    console.log('Кнопка календаря:', calendarBtn);
    console.log('Система навигации:', workingNavigation);
    console.log('Переход активен:', workingNavigation?.isTransitioning);
    
    if (startBtn) {
        console.log('🧪 Тестируем анимированный переход...');
        startBtn.click();
    }
};

// Совместимость с UniversalPageTransitions
window.UniversalPageTransitions = {
    init: function() { 
        console.log('🔄 UniversalPageTransitions перенаправлен на объединенную систему'); 
    },
    performTransition: function(url, type) { 
        if (workingNavigation) {
            workingNavigation.performAnimatedTransition(url, type);
        } else {
            window.location.href = url;
        }
    },
    isTransitioning: false,
    getStatus: function() {
        return {
            isTransitioning: workingNavigation?.isTransitioning || false,
            hasOverlay: !!workingNavigation?.overlay,
            currentPage: window.location.pathname
        };
    }
};

console.log('🎨 Объединенная система навигации с анимациями загружена');
console.log('🧪 Для тестирования: testAnimatedButtons()');
