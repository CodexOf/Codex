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
}

document.addEventListener('DOMContentLoaded', () => PageTransitions.init());