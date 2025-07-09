class PageTransitions {
    static isTransitioning = false;
    static transitionDuration = 800;
    
    static init() {
        try {
            console.log('Инициализация PageTransitions...');
            this.setupPageTransitions();
            
            if (document.querySelector('.welcome-screen')) {
                this.initHomePage();
            }
            
            console.log('PageTransitions успешно инициализирован');
        } catch (error) {
            console.error('Ошибка при инициализации PageTransitions:', error);
        }
    }

    static setupPageTransitions() {
        const startButtons = document.querySelectorAll('.start-button');
        
        if (!startButtons.length) {
            console.warn('Кнопки start-button не найдены');
            return;
        }
        
        startButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Предотвращаем множественные клики
                if (PageTransitions.isTransitioning) {
                    console.log('Переход уже выполняется, игнорируем клик');
                    return;
                }
                
                const targetUrl = this.getAttribute('href');
                if (!targetUrl) {
                    console.error('Отсутствует href у кнопки');
                    return;
                }
                
                PageTransitions.performExitAnimation(targetUrl);
            });
        });
        
        console.log('Обработчики событий для', startButtons.length, 'кнопок установлены');
    }

    static performExitAnimation(targetUrl) {
        if (this.isTransitioning) {
            console.warn('Переход уже выполняется');
            return;
        }
        
        console.log('Начало анимации выхода с главной страницы:', targetUrl);
        this.isTransitioning = true;
        
        // Получаем элементы для анимации с проверкой существования
        const elements = {
            gameTitle: document.querySelector('.game-title'),
            gameSubtitle: document.querySelector('.game-subtitle'),
            startButton: document.querySelector('.start-button'),
            footer: document.querySelector('.main-footer'),
            welcomeScreen: document.querySelector('.welcome-screen')
        };
        
        // Проверяем наличие основных элементов
        if (!elements.welcomeScreen) {
            console.error('welcome-screen не найден, выполняем обычный переход');
            this.fallbackTransition(targetUrl);
            return;
        }
        
        // Отключаем возможность повторного клика
        const allButtons = document.querySelectorAll('.start-button');
        allButtons.forEach(btn => {
            btn.style.pointerEvents = 'none';
            btn.style.cursor = 'not-allowed';
        });
        
        try {
            // Фаза 1 (0-400мс): Затухание текстовых элементов
            console.log('Фаза 1: Затухание текстовых элементов');
            const textElements = [
                elements.gameTitle, 
                elements.gameSubtitle, 
                elements.startButton, 
                elements.footer
            ].filter(el => el !== null);
            
            textElements.forEach(element => {
                if (element) {
                    element.classList.add('exit-text-animation');
                }
            });
            
            // Фаза 2 (400-800мс): Затухание фона
            setTimeout(() => {
                console.log('Фаза 2: Затухание фона');
                if (elements.welcomeScreen) {
                    elements.welcomeScreen.classList.add('exit-background-animation');
                }
            }, 400);
            
            // Фаза 3 (800мс): Переход на новую страницу
            setTimeout(() => {
                console.log('Фаза 3: Переход на новую страницу');
                this.navigateToPage(targetUrl);
            }, this.transitionDuration);
            
        } catch (error) {
            console.error('Ошибка во время анимации:', error);
            setTimeout(() => {
                this.navigateToPage(targetUrl);
            }, 100);
        }
    }
    
    static fallbackTransition(targetUrl) {
        console.log('Выполняем резервный переход на:', targetUrl);
        setTimeout(() => {
            this.navigateToPage(targetUrl);
        }, 100);
    }
    
    static navigateToPage(targetUrl) {
        try {
            if (!targetUrl || typeof targetUrl !== 'string') {
                console.error('Некорректный URL:', targetUrl);
                return;
            }
            
            let normalizedUrl = targetUrl.trim();
            
            if (!normalizedUrl) {
                console.error('Пустой URL после нормализации');
                return;
            }
            
            console.log('Переходим на страницу:', normalizedUrl);
            window.location.href = normalizedUrl;
            
        } catch (error) {
            console.error('Ошибка при переходе на страницу:', error);
            try {
                window.location = targetUrl;
            } catch (finalError) {
                console.error('Критическая ошибка перехода:', finalError);
                alert('Ошибка при переходе на страницу. Попробуйте еще раз.');
            }
        } finally {
            this.isTransitioning = false;
        }
    }

    static initHomePage() {
        console.log('Инициализация главной страницы');
        
        const welcomeScreen = document.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.addEventListener('click', (e) => {
                if (!e.target.closest('.start-button')) {
                    e.preventDefault();
                }
            });
        }
        
        this.checkFontsLoaded();
        this.setupKeyboardNavigation();
        
        console.log('Главная страница инициализирована');
    }
    
    static checkFontsLoaded() {
        let fontsLoaded = false;
        
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                console.log('Все шрифты загружены успешно');
                this.markFontsAsLoaded();
                fontsLoaded = true;
            }).catch((error) => {
                console.warn('Ошибка при загрузке шрифтов:', error);
                this.markFontsAsLoaded();
            });
            
            document.fonts.load('700 1em "Cinzel Decorative"').then(() => {
                console.log('Cinzel Decorative загружен');
                this.markFontsAsLoaded();
                fontsLoaded = true;
            }).catch((error) => {
                console.warn('Ошибка при загрузке Cinzel Decorative:', error);
            });
        }
        
        setTimeout(() => {
            if (!fontsLoaded) {
                console.log('Применяем fallback для шрифтов');
                this.markFontsAsLoaded();
            }
        }, 3000);
    }
    
    static markFontsAsLoaded() {
        try {
            document.body.classList.add('fonts-loaded');
            console.log('Класс fonts-loaded добавлен');
        } catch (error) {
            console.error('Ошибка при добавлении класса fonts-loaded:', error);
        }
    }
    
    static setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const startButton = document.getElementById('startButton');
                if (startButton && document.activeElement === startButton) {
                    e.preventDefault();
                    startButton.click();
                }
            }
            
            if (e.key === 'Escape' && this.isTransitioning) {
                console.log('Попытка отмены перехода через Escape');
            }
        });
        
        console.log('Клавиатурная навигация настроена');
    }
    
    static getStatus() {
        return {
            isTransitioning: this.isTransitioning,
            transitionDuration: this.transitionDuration,
            elementsFound: {
                welcomeScreen: !!document.querySelector('.welcome-screen'),
                startButton: !!document.getElementById('startButton'),
                gameTitle: !!document.querySelector('.game-title'),
                gameSubtitle: !!document.querySelector('.game-subtitle'),
                footer: !!document.querySelector('.main-footer')
            }
        };
    }
    
    static debug() {
        console.log('=== DEBUG PageTransitions ===');
        console.log('Статус:', this.getStatus());
        console.log('Fonts API поддерживается:', 'fonts' in document);
        console.log('Класс fonts-loaded:', document.body.classList.contains('fonts-loaded'));
    }
    
    static reset() {
        this.isTransitioning = false;
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.style.pointerEvents = '';
            startButton.style.cursor = '';
        }
        console.log('Состояние PageTransitions сброшено');
    }
}

function initializePageTransitions() {
    try {
        if (document.readyState === 'loading') {
            console.log('DOM еще загружается, ждем DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => PageTransitions.init(), 50);
            });
        } else {
            console.log('DOM готов, инициализируем PageTransitions');
            setTimeout(() => PageTransitions.init(), 50);
        }
    } catch (error) {
        console.error('Критическая ошибка при инициализации:', error);
    }
}

initializePageTransitions();

if (typeof window !== 'undefined') {
    window.PageTransitions = PageTransitions;
}

if (document.readyState === 'complete') {
    console.log('Документ уже полностью загружен, выполняем немедленную инициализацию');
    setTimeout(() => PageTransitions.init(), 10);
}