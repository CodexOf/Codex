class PageTransitions {
    static init() {
        // Инициализация только для не-content страниц
        if (!window.location.pathname.includes('content.html')) {
            this.setupPageTransitions();
        }
        
        // Определение типа страницы
        if (document.querySelector('.welcome-screen')) {
            this.initHomePage();
        } else if (document.querySelector('.main-content')) {
            this.initContentPage();
        }
    }

    static setupPageTransitions() {
        // Обработка переходов между страницами
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="/"], a[href^="#"], a[href^="http"]:not([target="_blank"]), a:not([href^="mailto:"])');
            
            if (link && link.href && !link.hash) {
                e.preventDefault();
                const transition = document.getElementById('pageTransition');
                
                if (!link.href.includes('#')) {
                    transition.style.opacity = '1';
                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 800);
                }
            }
        });
    }

    static initHomePage() {
        // Анимации для главной страницы
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
        // Инициализация функционала content.html
        this.initVersionSelectors();
        this.initMobileMenu();
    }

    static initVersionSelectors() {
        // Обработка кнопок выбора версий
        document.querySelectorAll('.version-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
        });
    }

    static initMobileMenu() {
        // Мобильное меню для маленьких экранов
        if (window.innerWidth <= 992) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'mobile-menu-toggle';
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            document.body.appendChild(menuToggle);
            
            menuToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('mobile-open');
            });
        }
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => PageTransitions.init());