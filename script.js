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
                const transition = document.getElementById('pageTransition');
                if (transition) {
                    transition.style.opacity = '1';
                    setTimeout(() => {
                        window.location.href = this.getAttribute('href');
                    }, 800);
                }
            });
        }
    }

    static initHomePage() {
        // Дополнительная инициализация главной страницы
    }
}

document.addEventListener('DOMContentLoaded', () => {
    PageTransitions.init();
});