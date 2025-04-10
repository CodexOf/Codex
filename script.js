/**
 * Класс для управления переходами между страницами
 * и другими интерактивными элементами
 */
class PageTransitions {
    /**
     * Инициализация всех функций
     */
    static init() {
        this.setupPageTransitions(); // Настройка переходов
        
        // Определяем тип страницы
        if (this.isHomePage()) {
            this.initHomePage(); // Инициализация главной
        } else if (this.isContentPage()) {
            this.initContentPage(); // Инициализация контента
        }
    }

    /**
     * Проверка главной страницы
     */
    static isHomePage() {
        return document.querySelector('.welcome-screen') !== null;
    }

    /**
     * Проверка страницы контента
     */
    static isContentPage() {
        return document.querySelector('.content-wrapper, .main-content') !== null;
    }

    /**
     * Настройка плавных переходов между страницами
     */
    static setupPageTransitions() {
        // Обработчик всех кликов по ссылкам
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a'); // Ближайшая ссылка
            
            // Проверяем нужные нам ссылки
            if (link && this.isInternalLink(link)) {
                e.preventDefault(); // Отменяем стандартное поведение
                this.handleTransition(link); // Запускаем анимацию
            }
        });
    }

    /**
     * Проверка внутренних ссылок
     */
    static isInternalLink(link) {
        return link.href && 
               !link.hash && 
               !link.target === '_blank' && 
               !link.href.startsWith('mailto:');
    }

    /**
     * Обработка анимации перехода
     */
    static handleTransition(link) {
        const transition = document.getElementById('pageTransition');
        
        // Запуск анимации
        transition.style.opacity = '1';
        
        // Переход после анимации
        setTimeout(() => {
            window.location.href = link.href;
        }, 800);
    }

    /**
     * Инициализация главной страницы
     */
    static initHomePage() {
        const startButton = document.getElementById('startButton');
        
        if (startButton) {
            // Анимация при наведении
            startButton.addEventListener('mouseenter', () => {
                startButton.style.transform = 'scale(1.05)';
            });
            
            startButton.addEventListener('mouseleave', () => {
                startButton.style.transform = 'scale(1)';
            });
        }
    }

    /**
     * Инициализация страницы контента
     */
    static initContentPage() {
        this.createMobileMenuButton(); // Кнопка меню для мобильных
    }

    /**
     * Создание кнопки меню для мобильных
     */
    static createMobileMenuButton() {
        const button = document.createElement('button');
        button.className = 'menu-toggle';
        button.innerHTML = '<i class="fas fa-bars"></i>';
        document.body.appendChild(button);
        
        // Обработчик клика
        button.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
}

// Запуск при полной загрузке DOM
document.addEventListener('DOMContentLoaded', () => PageTransitions.init());