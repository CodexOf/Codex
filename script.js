/**
 * Основной скрипт сайта
 * Работает на всех страницах
 */

// Ждем полной загрузки DOM перед выполнением скриптов
document.addEventListener('DOMContentLoaded', function() {
    
    // ===== Плавная прокрутка для якорных ссылок =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault(); // Отменяем стандартное поведение
            
            // Получаем целевой элемент по ID из href
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            // Если элемент существует, плавно прокручиваем к нему
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Учитываем высоту шапки
                    behavior: 'smooth' // Плавная прокрутка
                });
            }
        });
    });
    
    // ===== Анимация карточек при появлении в viewport =====
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.rule-card, .content-section');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Инициализация анимаций
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Запускаем сразу при загрузке
    
    // ===== Дополнительные эффекты для кнопок =====
    const buttons = document.querySelectorAll('.start-button, .back-button');
    
    buttons.forEach(button => {
        // Эффект при наведении
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });
        
        // Эффект при уходе курсора
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
        
        // Эффект при нажатии
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'scale(1.05)';
        });
    });
    
    // ===== Инициализация других компонентов =====
    console.log('Сайт полностью загружен и готов!');
});