// Файл: assets/js/spa-router.js
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  
  // 1. Определяем текущий путь (например, "/about")
  const path = window.location.pathname.replace(/^\//, '') || 'index';

  // 2. Загружаем Markdown-файл из папки _pages
  fetch(`/_pages/${path}.md`)
    .then(response => {
      if (!response.ok) throw new Error('Страница не найдена');
      return response.text();
    })
    .then(markdown => {
      // 3. Конвертируем Markdown в HTML (используем marked.js)
      app.innerHTML = marked.parse(markdown);
    })
    .catch(() => {
      // 4. Обработка ошибок (например, 404)
      app.innerHTML = '<h1>404</h1><p>Страница не найдена</p>';
    });
});