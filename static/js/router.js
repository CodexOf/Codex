class AppRouter {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.initEventListeners();
    this.loadInitialContent();
  }

  initEventListeners() {
    // Обработка кнопки в оригинальном index.html
    const startButton = document.getElementById('startButton');
    if (startButton) {
      startButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToApp();
      });
    }

    // Обработка истории браузера
    window.addEventListener('popstate', () => this.handleRouting());
  }

  navigateToApp() {
    history.pushState({ isApp: true }, '', '/app');
    this.loadAppContent();
  }

  loadInitialContent() {
    if (window.location.pathname === '/app') {
      this.loadAppContent();
    }
  }

  async loadAppContent() {
    try {
      const response = await fetch('/app-content');
      const html = await response.text();
      this.appContainer.innerHTML = html;
      this.initAppComponents();
    } catch (error) {
      console.error('Failed to load app content:', error);
    }
  }

  initAppComponents() {
    // Здесь можно инициализировать компоненты SPA
  }

  handleRouting() {
    if (window.location.pathname === '/app') {
      this.loadAppContent();
    }
  }
}

export const router = new AppRouter();