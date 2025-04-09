// Ждем полной загрузки DOM перед выполнением скрипта
document.addEventListener('DOMContentLoaded', function() {
    
    // Находим кнопку "Начать приключение" по классу
    const startButton = document.querySelector('.start-button');
    
    // Добавляем обработчик события клика
    startButton.addEventListener('click', function(e) {
        e.preventDefault(); // Отменяем стандартное поведение ссылки
        
        // Получаем ID целевого элемента из атрибута href
        const targetId = this.getAttribute('href');
        
        // Находим целевой элемент на странице
        const targetElement = document.querySelector(targetId);
        
        // Плавная прокрутка к целевому элементу
        window.scrollTo({
            top: targetElement.offsetTop, // Позиция элемента от верха страницы
            behavior: 'smooth' // Тип прокрутки (плавная)
        });
    });
    
    // Дополнительные скрипты можно добавлять здесь
});