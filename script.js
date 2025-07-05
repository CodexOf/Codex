class PageTransitions {
    static init() {
        this.setupPageTransitions();
        if (document.querySelector('.welcome-screen')) {
            this.initHomePage();
        }
    }

    static setupPageTransitions() {
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', function(e) {
                e.preventDefault();
                PageTransitions.performExitAnimation(this.getAttribute('href'));
            });
        }
    }

    static performExitAnimation(targetUrl) {
        console.log('Начало анимации выхода с главной страницы');
        
        // Получаем элементы для анимации
        const gameTitle = document.querySelector('.game-title');
        const gameSubtitle = document.querySelector('.game-subtitle');
        const startButton = document.querySelector('.start-button');
        const footer = document.querySelector('.main-footer');
        const welcomeScreen = document.querySelector('.welcome-screen');
        
        // Отключаем возможность повторного клика
        if (startButton) {
            startButton.style.pointerEvents = 'none';
        }
        
        // Фаза 1 (0-400мс): Затухание текстовых элементов
        console.log('Фаза 1: Затухание текстовых элементов');
        const textElements = [gameTitle, gameSubtitle, startButton, footer].filter(el => el);
        textElements.forEach(element => {
            element.classList.add('exit-text-animation');
        });
        
        // Фаза 2 (400-800мс): Затухание фона
        setTimeout(() => {
            console.log('Фаза 2: Затухание фона');
            if (welcomeScreen) {
                welcomeScreen.classList.add('exit-background-animation');
            }
        }, 400);
        
        // Фаза 3 (800мс): Переход на новую страницу
        setTimeout(() => {
            console.log('Фаза 3: Переход на новую страницу');
            window.location.href = targetUrl;
        }, 800);
    }

    static initHomePage() {
        // Дополнительная инициализация главной страницы
    }
}

document.addEventListener('DOMContentLoaded', () => {
    PageTransitions.init();
});