class PageTransitions {
    static init() {
        this.setupPageTransitions();
        
        if (document.querySelector('.welcome-screen')) {
            this.initHomePage();
        } else if (document.querySelector('.content-wrapper') || document.querySelector('.main-content')) {
            this.initContentPage();
        }
    }

    static setupPageTransitions() {
        document.addEventListener('click', (e) => {
            // Пропускаем анимацию для content.html
            if (window.location.pathname.includes('content.html')) return;
            
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

        // Меню для мобильных
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(menuToggle);
        
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => PageTransitions.init());