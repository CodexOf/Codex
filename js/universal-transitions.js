/**
 * Универсальная система анимаций переходов между страницами
 * Поддерживает переходы между всеми страницами сайта с анимацией затемнения
 */

class UniversalPageTransitions {
    static isTransitioning = false;
    static transitionDuration = 1200;
    static overlay = null;
    
    static init() {
        try {
            console.log('🚀 Инициализация UniversalPageTransitions...');
            this.createTransitionOverlay();
            this.setupPageTransitions();
            this.handlePageEntrance();
            console.log('✅ UniversalPageTransitions успешно инициализирован');
        } catch (error) {
            console.error('❌ Ошибка при инициализации UniversalPageTransitions:', error);
        }
    }

    /**
     * Создает универсальный оверлей для переходов
     */
    static createTransitionOverlay() {
        if (this.overlay) return;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'page-transition-overlay';
        this.overlay.id = 'universalTransitionOverlay';
        document.body.appendChild(this.overlay);
        
        console.log('📱 Оверлей для переходов создан');
    }

    /**
     * Настраивает обработчики для всех ссылок на сайте
     */
    static setupPageTransitions() {
        // Обработчики для всех ссылок, ведущих на другие страницы
        this.setupMainNavigation();
        this.setupContentNavigation();
        this.setupCalendarNavigation();
        this.setupAuthNavigation();
        
        console.log('🔗 Обработчики переходов настроены');
    }

    /**
     * Настройка для главной страницы (index.html)
     */
    static setupMainNavigation() {
        // Кнопки на главной странице
        const startButtons = document.querySelectorAll('.start-button:not(.calendar-button)');
        const calendarButton = document.querySelector('.start-button.calendar-button');
        
        startButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isTransitioning) return;
                
                const targetUrl = button.getAttribute('href');
                this.performTransition(targetUrl, 'main-page');
            });
        });

        // Отдельная обработка для кнопки календаря
        if (calendarButton) {
            calendarButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isTransitioning) return;
                
                const targetUrl = calendarButton.getAttribute('href');
                this.performTransition(targetUrl, 'calendar-page');
            });
        }
    }

    /**
     * Настройка для страницы контента (content.html)
     */
    static setupContentNavigation() {
        // Кнопка возврата на главную (если есть)
        const backButton = document.querySelector('.back-btn[href="index.html"]');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isTransitioning) return;
                
                this.performTransition('index.html', 'back-to-main');
            });
        }

        // Проверка авторизации
        const calendarWidget = document.getElementById('calendarWidget');
        if (calendarWidget) {
            calendarWidget.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isTransitioning) return;
                
                // Используем серверную систему авторизации
                if (window.authManager && window.authManager.isAuthenticated()) {
                    this.performTransition('calendar.html', 'to-calendar');
                } else {
                    this.performTransition('auth.html?returnTo=calendar', 'to-auth');
                }
            });
        }
    }

    /**
     * Настройка для страницы календаря (calendar.html)
     */
    static setupCalendarNavigation() {
        // Кнопка возврата к контенту
        const backToContentButton = document.querySelector('.back-btn[href="content.html"]');
        if (backToContentButton) {
            backToContentButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isTransitioning) return;
                
                this.performTransition('content.html', 'back-to-content');
            });
        }

        // Виджет контента
        const contentWidget = document.getElementById('contentWidget');
        if (contentWidget) {
            contentWidget.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isTransitioning) return;
                
                this.performTransition('content.html', 'to-content');
            });
        }

        // Кнопка выхода (возврат на главную)
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                if (this.isTransitioning) return;
                
                // Выполняем выход и переходим на главную
                if (window.authManager) {
                    window.authManager.logout();
                }
                
                e.preventDefault();
                this.performTransition('index.html', 'logout');
            });
        }
    }

    /**
     * Настройка для страниц авторизации
     */
    static setupAuthNavigation() {
        // Обработка успешной авторизации
        const authForms = document.querySelectorAll('form[data-auth-form]');
        authForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                // Здесь можно добавить логику для анимированного перехода после авторизации
                // В зависимости от параметра returnTo
            });
        });
    }

    /**
     * Выполняет анимированный переход на указанную страницу
     */
    static performTransition(targetUrl, transitionType = 'default') {
        if (this.isTransitioning) {
            console.warn('⚠️ Переход уже выполняется');
            return;
        }

        if (!targetUrl) {
            console.error('❌ Отсутствует URL для перехода');
            return;
        }

        console.log(`🔄 Начинаем переход: ${transitionType} -> ${targetUrl}`);
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
            console.error('❌ Ошибка во время анимации перехода:', error);
            this.fallbackTransition(targetUrl);
        }
    }

    /**
     * Затемняет элементы текущей страницы в зависимости от типа
     */
    static fadeOutPageElements(transitionType) {
        console.log(`🌟 Затемнение элементов: ${transitionType}`);

        switch (transitionType) {
            case 'main-page':
                this.fadeOutMainPageElements();
                break;
            case 'calendar-page':
            case 'to-calendar':
                this.fadeOutGenericElements();
                break;
            case 'back-to-content':
            case 'to-content':
                this.fadeOutCalendarElements();
                break;
            case 'back-to-main':
            case 'logout':
                this.fadeOutGenericElements();
                break;
            default:
                this.fadeOutGenericElements();
        }
    }

    /**
     * Затемнение элементов главной страницы
     */
    static fadeOutMainPageElements() {
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

    /**
     * Затемнение элементов календаря
     */
    static fadeOutCalendarElements() {
        const elements = [
            '.calendar-header',
            '.calendar-controls',
            '.events-list-section',
            '.calendar-grid',
            '.content-widget'
        ];

        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('exit-text-animation');
            }
        });
    }

    /**
     * Универсальное затемнение для остальных страниц
     */
    static fadeOutGenericElements() {
        const elements = [
            '.sidebar',
            '.main-content',
            '.calendar-container',
            '.back-to-content',
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

    /**
     * Обрабатывает появление страницы при загрузке
     */
    static handlePageEntrance() {
        // Проверяем, пришли ли мы с другой страницы через анимацию
        const fromTransition = sessionStorage.getItem('pageTransition');
        
        if (fromTransition) {
            console.log('📥 Восстановление после перехода:', fromTransition);
            
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

    /**
     * Переходит на новую страницу
     */
    static navigateToPage(targetUrl) {
        try {
            // Сохраняем информацию о переходе
            sessionStorage.setItem('pageTransition', 'true');
            
            console.log('🌐 Переход на страницу:', targetUrl);
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
    static fallbackTransition(targetUrl) {
        console.log('🔄 Резервный переход на:', targetUrl);
        setTimeout(() => {
            window.location.href = targetUrl;
            this.isTransitioning = false;
        }, 100);
    }

    /**
     * Сброс состояния переходов
     */
    static reset() {
        this.isTransitioning = false;
        document.body.classList.remove('transitioning');
        
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        
        console.log('🔄 Состояние переходов сброшено');
    }

    /**
     * Информация о состоянии системы
     */
    static getStatus() {
        return {
            isTransitioning: this.isTransitioning,
            hasOverlay: !!this.overlay,
            currentPage: window.location.pathname,
            elementsFound: {
                startButtons: document.querySelectorAll('.start-button').length,
                calendarWidget: !!document.getElementById('calendarWidget'),
                contentWidget: !!document.getElementById('contentWidget'),
                backButtons: document.querySelectorAll('.back-btn').length
            }
        };
    }

    /**
     * Отладочная информация
     */
    static debug() {
        console.log('=== DEBUG UniversalPageTransitions ===');
        console.log('Статус:', this.getStatus());
        console.log('Overlay элемент:', this.overlay);
        console.log('Переход активен:', this.isTransitioning);
    }
}

/**
 * Автоматическая инициализация при загрузке страницы
 */
function initializeUniversalTransitions() {
    try {
        if (document.readyState === 'loading') {
            console.log('⏳ DOM загружается, ждем DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => UniversalPageTransitions.init(), 50);
            });
        } else {
            console.log('✅ DOM готов, инициализируем переходы');
            setTimeout(() => UniversalPageTransitions.init(), 50);
        }
    } catch (error) {
        console.error('❌ Критическая ошибка инициализации:', error);
    }
}

// Запуск инициализации
initializeUniversalTransitions();

// Экспорт для глобального доступа
if (typeof window !== 'undefined') {
    window.UniversalPageTransitions = UniversalPageTransitions;
}

// Дополнительная проверка на случай полной загрузки
if (document.readyState === 'complete') {
    console.log('📄 Документ полностью загружен, немедленная инициализация');
    setTimeout(() => UniversalPageTransitions.init(), 10);
}
