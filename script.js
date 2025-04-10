class PageTransitions {
    static init() {
        if (!window.location.pathname.includes('content.html')) {
            this.setupPageTransitions();
        }
        
        if (document.querySelector('.welcome-screen')) {
            this.initHomePage();
        } else if (document.querySelector('.main-content')) {
            this.initContentPage();
        }
    }

    static initContentPage() {
        this.initVersionSelectors();
        this.highlightActiveNav(); // Добавленная функция
    }

    static initVersionSelectors() {
        document.querySelectorAll('.version-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
        });
    }

    // Новая функция для подсветки активного пункта меню
    static highlightActiveNav() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            const linkPage = link.getAttribute('href');
            link.classList.toggle('active', linkPage === currentPage);
        });
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
        // Дополнительные функции для главной страницы (если нужны)
    }
}

// Инициализация при загрузке документа
document.addEventListener('DOMContentLoaded', () => {
    PageTransitions.init();
});