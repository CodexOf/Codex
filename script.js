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
                PageTransitions.startExitAnimation(this.getAttribute('href'));
            });
        }
    }

    static startExitAnimation(targetUrl) {
        // Получаем элементы для анимации
        const welcomeContent = document.querySelector('.welcome-content');
        const footer = document.querySelector('.main-footer');
        const welcomeScreen = document.querySelector('.welcome-screen');
        
        // Фаза 1 (0-400мс): Затухание текста и кнопки
        if (welcomeContent) {
            welcomeContent.style.transition = 'opacity 0.4s ease-out';
            welcomeContent.style.opacity = '0';
        }
        
        if (footer) {
            footer.style.transition = 'opacity 0.4s ease-out';
            footer.style.opacity = '0';
        }
        
        // Фаза 2 (400-800мс): Затухание фона
        setTimeout(() => {
            if (welcomeScreen) {
                welcomeScreen.style.transition = 'opacity 0.4s ease-out';
                welcomeScreen.style.opacity = '0';
            }
        }, 400);
        
        // Фаза 3 (800мс): Переход на новую страницу
        setTimeout(() => {
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