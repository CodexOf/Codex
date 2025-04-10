// 1. Гарантированное подключение стилей
function enforceStyles() {
  const styleId = 'enforced-stylesheet';
  if (!document.getElementById(styleId)) {
    const link = document.createElement('link');
    link.id = styleId;
    link.rel = 'stylesheet';
    link.href = '/static/css/style.css';
    document.head.appendChild(link);
  }
}

// 2. Проверка существующих стилей
function checkStyles() {
  const existingStyles = document.querySelectorAll('link[rel="stylesheet"]');
  let styleExists = false;
  
  existingStyles.forEach(style => {
    if (style.href.includes('/static/css/style.css')) {
      styleExists = true;
    }
  });

  if (!styleExists) {
    enforceStyles();
  }
}

// 3. Инициализация
document.addEventListener('DOMContentLoaded', () => {
  // Проверяем стили сразу
  checkStyles();
  
  // Проверяем каждые 2 секунды
  setInterval(checkStyles, 2000);

  // Обработчик кнопки (SPA переход)
  document.getElementById('startButton')?.addEventListener('click', (e) => {
    e.preventDefault();
    history.pushState({}, '', '/app');
    loadSPAContent();
  });
});

// 4. Загрузка SPA-контента
async function loadSPAContent() {
  try {
    const response = await fetch('/app-content');
    if (!response.ok) throw new Error('Ошибка загрузки');
    
    document.body.innerHTML = await response.text();
    enforceStyles(); // Переподключаем стили
    
    // Реинициализация кнопки
    document.getElementById('startButton')?.addEventListener('click', () => {
      history.back();
    });
  } catch (error) {
    console.error('Ошибка SPA:', error);
  }
}

// 5. Обработка истории браузера
window.addEventListener('popstate', () => {
  if (location.pathname === '/') {
    location.reload();
  } else {
    loadSPAContent();
  }
});