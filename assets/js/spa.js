// Файл: assets/js/spa.js
/**
 * SPA-логика для Jekyll-сайта
 * Работает с существующей структурой (_pages, _posts)
 */

// 1. Настройки
const PAGES_DIR = '/_pages/';  // Путь к Markdown-страницам
const APP_ID = 'app';          // ID контейнера для контента

// 2. Загрузка страницы
async function loadPage(page = 'index') {
  try {
    // Загружаем Markdown-файл
    const response = await fetch(`${PAGES_DIR}${page}.md`);
    if (!response.ok) throw new Error('Страница не найдена');
    
    const markdown = await response.text();
    renderContent(markdown);
  } catch (error) {
    console.error('Ошибка:', error);
    document.getElementById(APP_ID).innerHTML = `
      <h1>404</h1>
      <p>Страница не найдена</p>
    `;
  }
}

// 3. Рендер Markdown (используем marked.js)
function renderContent(markdown) {
  document.getElementById(APP_ID).innerHTML = marked.parse(markdown);
}

// 4. Обработчик навигации
document.addEventListener('DOMContentLoaded', () => {
  // Динамически обрабатываем клики по ссылкам
  document.body.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.includes('_pages')) {
      e.preventDefault();
      const page = e.target.getAttribute('href').split('/').pop().replace('.md', '');
      window.history.pushState({}, '', `/${page}`);
      loadPage(page);
    }
  });

  // Обработка кнопки "Назад"
  window.addEventListener('popstate', () => {
    const page = window.location.pathname.slice(1) || 'index';
    loadPage(page);
  });

  // Первая загрузка
  loadPage(window.location.pathname.slice(1) || 'index');
});