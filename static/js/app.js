document.addEventListener('DOMContentLoaded', () => {
  // Обработчик кнопки без изменения index.html
  const startButton = document.getElementById('startButton');
  if (startButton) {
    startButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Загружаем SPA-контент
      try {
        const response = await fetch('/app-content');
        if (!response.ok) throw new Error('Network error');
        
        const html = await response.text();
        
        // Сохраняем текущий head (со стилями)
        const headContent = document.head.innerHTML;
        
        // Заменяем контент
        document.body.innerHTML = html;
        document.head.innerHTML = headContent; // Восстанавливаем стили
        
        // Инициализируем SPA-роутер
        initSPARouter();
      } catch (error) {
        console.error('SPA transition failed:', error);
      }
    });
  }
});

function initSPARouter() {
  // Ваша логика для SPA-переходов
  console.log('SPA initialized');
}