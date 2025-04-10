export const router = {
  init() {
    // Обработка начальной загрузки
    if (window.location.pathname === '/content') {
      this.loadContent();
    }
    
    // Обработка кнопки в index.html
    const startBtn = document.getElementById('startButton');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToContent();
      });
    }
  },

  navigateToContent() {
    history.pushState({}, '', '/content');
    this.loadContent();
  },

  loadContent() {
    fetch('/content')
      .then(response => response.text())
      .then(html => {
        document.body.innerHTML = html;
        // Реинициализация скриптов если нужно
      });
  }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => router.init());
window.addEventListener('popstate', () => router.loadContent());