class PageTransitions {
    static init() {
        this.setupPageTransitions();
        
        if (document.querySelector('.welcome-screen')) {
            this.initHomePage();
        } else if (document.querySelector('.content-wrapper')) {
            this.initContentPage();
        }
    }

    static setupPageTransitions() {
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