/**
 * Восстановленная рабочая система авторизации + только анимации
 * Основано на оригинальном коде с минимальными изменениями
 */

class AuthManager {
    constructor() {
        this.baseURL = 'https://codex-backend-production.up.railway.app';
        this.isInitialized = false;
        this.init();
    }

    /**
     * Инициализация системы авторизации
     */
    init() {
        if (this.isInitialized) return;
        
        console.log('🔐 Инициализация системы авторизации');
        this.setupAuthEventHandlers();
        this.checkExistingAuth();
        this.isInitialized = true;
        console.log('✅ Система авторизации готова');
    }

    /**
     * Настройка обработчиков событий авторизации
     */
    setupAuthEventHandlers() {
        // Проверяем, находимся ли мы на странице авторизации
        if (document.getElementById('login-form') || document.getElementById('register-form')) {
            this.setupAuthPageHandlers();
        }
    }

    /**
     * Настройка обработчиков для страницы авторизации
     */
    setupAuthPageHandlers() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        console.log('📝 Обработчики форм авторизации настроены');
    }

    /**
     * Обработка формы входа
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const button = form.querySelector('.form-button');
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            this.showError('Заполните все поля');
            return;
        }
        
        this.setButtonLoading(button, true);
        this.hideMessages();
        
        try {
            console.log('🔑 Попытка входа:', username);
            const result = await this.login(username, password);
            
            if (result.success) {
                this.showSuccess('Вход выполнен успешно! Перенаправление...');
                
                // Добавляем анимированный переход
                setTimeout(() => {
                    this.performAnimatedRedirect();
                }, 1500);
            } else {
                this.showError(result.error || 'Ошибка входа');
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            this.showError('Ошибка подключения к серверу');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    /**
     * Обработка формы регистрации
     */
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const button = form.querySelector('.form-button');
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        
        if (!username || !password || !passwordConfirm) {
            this.showError('Заполните все поля');
            return;
        }
        
        if (username.length < 3) {
            this.showError('Имя пользователя должно содержать минимум 3 символа');
            return;
        }
        
        if (password.length < 6) {
            this.showError('Пароль должен содержать минимум 6 символов');
            return;
        }
        
        if (password !== passwordConfirm) {
            this.showError('Пароли не совпадают');
            return;
        }
        
        this.setButtonLoading(button, true);
        this.hideMessages();
        
        try {
            console.log('📝 Попытка регистрации:', username);
            const result = await this.register(username, password);
            
            if (result.success) {
                this.showSuccess('Регистрация выполнена успешно! Перенаправление...');
                
                // Добавляем анимированный переход
                setTimeout(() => {
                    this.performAnimatedRedirect();
                }, 1500);
            } else {
                this.showError(result.error || 'Ошибка регистрации');
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            this.showError('Ошибка подключения к серверу');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    /**
     * НОВОЕ: Анимированный переход после авторизации
     */
    performAnimatedRedirect() {
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('returnTo');
        
        let targetUrl = 'content.html';
        let transitionType = 'auth-to-content';
        
        if (returnTo === 'calendar') {
            targetUrl = 'calendar.html';
            transitionType = 'auth-to-calendar';
        }
        
        console.log(`🚀 Анимированный переход после авторизации: ${transitionType} -> ${targetUrl}`);
        
        // Используем систему анимированных переходов, если доступна
        if (window.universalAnimatedTransitions) {
            window.universalAnimatedTransitions.performTransition(targetUrl, transitionType);
        } else {
            // Fallback - обычный переход
            console.log('⚠️ Система анимаций недоступна, обычный переход');
            window.location.href = targetUrl;
        }
    }

    /**
     * Оригинальный метод входа (без изменений)
     */
    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Сохраняем данные авторизации
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', username);
                localStorage.setItem('userId', data.userId || '');
                
                console.log('✅ Успешный вход:', username);
                return { success: true, user: username };
            } else {
                console.log('❌ Ошибка входа:', data.error);
                return { success: false, error: data.error || 'Неверные учетные данные' };
            }
        } catch (error) {
            console.error('❌ Ошибка сети при входе:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    /**
     * Оригинальный метод регистрации (без изменений)
     */
    async register(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Автоматически входим после регистрации
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', username);
                localStorage.setItem('userId', data.userId || '');
                
                console.log('✅ Успешная регистрация:', username);
                return { success: true, user: username };
            } else {
                console.log('❌ Ошибка регистрации:', data.error);
                return { success: false, error: data.error || 'Ошибка регистрации' };
            }
        } catch (error) {
            console.error('❌ Ошибка сети при регистрации:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    /**
     * Выход пользователя (обновлен с анимацией)
     */
    logout() {
        console.log('👋 Выход пользователя');
        
        // Очищаем данные авторизации
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userId');
        
        // Анимированный переход на главную, если система анимаций доступна
        if (window.universalAnimatedTransitions) {
            window.universalAnimatedTransitions.performTransition('index.html', 'logout');
        } else {
            window.location.href = 'index.html';
        }
    }

    /**
     * Оригинальные методы (без изменений)
     */
    isAuthenticated() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        return !!(token && user);
    }

    getCurrentUser() {
        return localStorage.getItem('currentUser');
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    checkExistingAuth() {
        if (this.isAuthenticated()) {
            const currentUser = this.getCurrentUser();
            console.log('✅ Пользователь уже авторизован:', currentUser);
            
            // Обновляем интерфейс, если мы на странице с информацией о пользователе
            const userDisplays = document.querySelectorAll('#currentUser, .current-user-name');
            userDisplays.forEach(element => {
                element.textContent = currentUser;
            });
        }
    }

    requireAuth(redirectTo = 'calendar') {
        if (!this.isAuthenticated()) {
            console.log('🔒 Требуется авторизация для доступа к', redirectTo);
            
            // Анимированный переход на страницу авторизации, если система доступна
            if (window.universalAnimatedTransitions) {
                window.universalAnimatedTransitions.performTransition(`auth.html?returnTo=${redirectTo}`, 'require-auth');
            } else {
                window.location.href = `auth.html?returnTo=${redirectTo}`;
            }
            return false;
        }
        return true;
    }

    showError(message) {
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');
        
        if (successEl) successEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
    }

    showSuccess(message) {
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');
        
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        }
    }

    hideMessages() {
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');
        
        if (errorEl) errorEl.style.display = 'none';
        if (successEl) successEl.style.display = 'none';
    }

    setButtonLoading(button, loading) {
        if (!button) return;
        
        if (loading) {
            button.classList.add('button-loading');
            button.disabled = true;
            const buttonText = button.querySelector('.button-text');
            if (buttonText) buttonText.style.opacity = '0';
        } else {
            button.classList.remove('button-loading');
            button.disabled = false;
            const buttonText = button.querySelector('.button-text');
            if (buttonText) buttonText.style.opacity = '1';
        }
    }

    getAuthStatus() {
        return {
            isAuthenticated: this.isAuthenticated(),
            currentUser: this.getCurrentUser(),
            hasToken: !!this.getAuthToken(),
            serverURL: this.baseURL
        };
    }
}

// Создание глобального экземпляра (как в оригинале)
let authManagerInstance = null;

function initAuthManager() {
    if (!authManagerInstance) {
        authManagerInstance = new AuthManager();
        window.authManager = authManagerInstance;
        console.log('🔐 AuthManager инициализирован');
    }
    return authManagerInstance;
}

// Инициализация при загрузке (как в оригинале)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthManager);
} else {
    initAuthManager();
}

// Дополнительная инициализация для надежности
setTimeout(initAuthManager, 500);

// Экспорт для использования в других скриптах
window.initAuthManager = initAuthManager;

console.log('🔐 Восстановленная система авторизации с анимациями загружена');
