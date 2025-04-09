// Основная функция инициализации
document.addEventListener('DOMContentLoaded', function() {
    console.log('Сайт загружен!');
    
    // Пример обработчика событий
    document.querySelector('h1').addEventListener('click', function() {
        alert('Приветствие!');
    });
});