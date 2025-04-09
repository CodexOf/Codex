// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // ===== ФУНКЦИЯ ДЛЯ ВКЛАДОК =====
    function initTabs() {
        // Получаем все кнопки вкладок
        const tabButtons = document.querySelectorAll('.tab-button');
        
        // Для каждой кнопки
        tabButtons.forEach(button => {
            // Обработчик клика
            button.addEventListener('click', () => {
                // 1. Убираем активный класс у всех кнопок
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // 2. Убираем активный класс у всего контента
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // 3. Добавляем активный класс текущей кнопке
                button.classList.add('active');
                
                // 4. Находим связанный контент и активируем его
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
                
                // 5. Сохраняем активную вкладку в localStorage
                localStorage.setItem('activeTab', tabId);
            });
        });
        
        // ===== ВОССТАНОВЛЕНИЕ АКТИВНОЙ ВКЛАДКИ =====
        // Проверяем, есть ли сохраненная вкладка
        const savedTab = localStorage.getItem('activeTab');
        
        // Если есть и такой элемент существует
        if (savedTab && document.getElementById(savedTab)) {
            // Активируем вкладку
            document.getElementById(savedTab).classList.add('active');
            document.querySelector(`[data-tab="${savedTab}"]`).classList.add('active');
        } else {
            // Иначе активируем первую вкладку по умолчанию
            document.querySelector('.tab-button').classList.add('active');
            document.querySelector('.tab-content').classList.add('active');
        }
    }

    // Инициализируем вкладки
    initTabs();
});