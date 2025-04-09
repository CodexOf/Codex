// Общие функции для всех страниц
class PageTransitions {
    static init() {
        // Инициализация переходов
        this.setupPageTransitions();
        
        // Инициализация специфичных для страницы элементов
        if (document.querySelector('.welcome-screen')) {
            this.initHomePage();
        } else if (document.querySelector('.content-wrapper')) {
            this.initContentPage();
        }
    }

    static setupPageTransitions() {
        // Обработка всех переходов между страницами
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="http"]:not([target="_blank"]), a[href^="/"], a[href^="#"]');
            
            if (link && !link.hash) {
                e.preventDefault();
                const transition = document.getElementById('pageTransition');
                
                transition.style.opacity = '1';
                
                setTimeout(() => {
                    window.location.href = link.href;
                }, 800);
            }
        });
    }

    static initHomePage() {
        // Дополнительная анимация для главной страницы
        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('mouseenter', () => {
                startButton.style.transform = 'scale(1.05)';
            });
            startButton.addEventListener('mouseleave', () => {
                startButton.style.transform = 'scale(1)';
            });
        }
    }

    static initContentPage() {
        // Плавная прокрутка для оглавления
        document.querySelectorAll('.toc-link').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.hash) {
                    e.preventDefault();
                    const target = document.querySelector(this.hash);
                    window.scrollTo({
                        top: target.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => PageTransitions.init());