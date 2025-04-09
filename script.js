/* ===== КЛАСС ДЛЯ УПРАВЛЕНИЯ ПЕРЕХОДАМИ ===== */
class PageTransitions {
    /* Инициализация всех обработчиков */
    static init() {
        this.setupPageTransitions();
        
        // Определяем тип страницы и запускаем соответствующие обработчики
        if (document.querySelector('.welcome-screen')) {
            this.initHomePage();
        } else if (document.querySelector('.content-wrapper') || document.querySelector('.main-content')) {
            this.initContentPage();
            this.animateContentLoad(); // Добавляем анимацию загрузки контента
        }
    }

    /* Настройка обработчиков для всех переходов */
    static setupPageTransitions() {
        document.addEventListener('click', (e) => {
            // Ищем ближайшую ссылку, но исключаем:
            // - ссылки с target="_blank"
            // - mailto ссылки
            const link = e.target.closest('a[href^="/"], a[href^="#"], a[href^="http"]:not([target="_blank"]), a:not([href^="mailto:"])');
            
            if (link && link.href && !link.hash) {
                e.preventDefault();
                const transition = document.getElementById('pageTransition');
                
                // Обрабатываем только переходы между страницами (не якоря)
                if (!link.href.includes('#')) {
                    // Запуск анимации исчезновения
                    transition.style.opacity = '1';
                    
                    // Переход после завершения анимации
                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 800);
                }
            }
        });
    }

    /* Анимация загрузки контента */
    static animateContentLoad() {
        const contentContainer = document.getElementById('content-container');
        if (contentContainer) {
            contentContainer.classList.add('content-load-animation');
        }
        
        // Боковая панель остается статичной без анимаций
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.opacity = '1';
        }
    }

    /* Обработчики для домашней страницы */
    static initHomePage() {
        const startButton = document.getElementById('startButton');
        if (startButton) {
            // Эффект при наведении на кнопку
            startButton.addEventListener('mouseenter', () => {
                startButton.style.transform = 'scale(1.05)';
            });
            
            startButton.addEventListener('mouseleave', () => {
                startButton.style.transform = 'scale(1)';
            });
        }
    }

    /* Обработчики для страницы контента */
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

        // Создание кнопки меню для мобильных устройств
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(menuToggle);
        
        // Обработчик клика по меню
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}

/* Запуск при полной загрузке DOM */
document.addEventListener('DOMContentLoaded', () => {
    PageTransitions.init();
    
    // Плавное появление body
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.8s ease';
        document.body.style.opacity = '1';
    }, 50);
});