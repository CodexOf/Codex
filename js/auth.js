// Система авторизации для Codex
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = this.getCurrentUser();
        this.baseURL = this.getBaseURL();
    }

    getBaseURL() {
        // Определяем базовый URL для API
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `http://${window.location.hostname}:3000`;
        }
        
        // Для Render.com или другого хостинга
        if (window.location.hostname.includes('github.io')) {
            // Если открыто с GitHub Pages, используем URL Render
            return 'https://codex-of.onrender.com';
        }
        
        // Для продакшена используем тот же домен
        return window.location.origin;
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Ошибка парсинга данных пользователя:', error);
            return null;
        }
    }

    isAuthenticated() {
        return !!(this.token && this.user);
    }

    async makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseURL}${url}`, {
            ...options,
            headers
        });

        // Если токен недействителен, выходим из системы
        if (response.status === 401 && url !== '/api/user') {
            this.logout();
            throw new Error('Сессия истекла. Необходимо войти снова.');
        }

        return response;
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    async register(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    async logout() {
        try {
            if (this.token) {
                await this.makeAuthenticatedRequest('/api/logout', {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
        } finally {
            // Очищаем локальные данные в любом случае
            this.token = null;
            this.user = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            
            // Перенаправляем на страницу авторизации
            window.location.href = 'auth.html';
        }
    }

    async verifyToken() {
        if (!this.token) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}/api/user`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 401) {
                // Токен недействителен
                this.token = null;
                this.user = null;
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                return false;
            }
            
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    this.user = data.user;
                    localStorage.setItem('currentUser', JSON.stringify(this.user));
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('Ошибка проверки токена:', error);
            return false;
        }
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }
}

// Система управления событиями с авторизацией
class EventManager {
    constructor(authManager) {
        this.auth = authManager;
        this.events = [];
    }

    async loadEvents() {
        try {
            const response = await this.auth.makeAuthenticatedRequest('/api/events');
            const data = await response.json();
            
            if (Array.isArray(data)) {
                this.events = data;
                return this.events;
            } else {
                throw new Error('Неверный формат данных событий');
            }
        } catch (error) {
            console.error('Ошибка загрузки событий:', error);
            throw error;
        }
    }

    async createEvent(eventData) {
        try {
            const response = await this.auth.makeAuthenticatedRequest('/api/events', {
                method: 'POST',
                body: JSON.stringify(eventData)
            });

            const data = await response.json();
            
            if (data.success) {
                this.events.push(data.event);
                return { success: true, event: data.event };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Ошибка создания события:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    async updateEvent(eventId, eventData) {
        try {
            const response = await this.auth.makeAuthenticatedRequest(`/api/events/${eventId}`, {
                method: 'PUT',
                body: JSON.stringify(eventData)
            });

            const data = await response.json();
            
            if (data.success) {
                // Обновляем событие в локальном массиве
                const index = this.events.findIndex(e => e.id === eventId);
                if (index !== -1) {
                    this.events[index] = data.event;
                }
                return { success: true, event: data.event };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Ошибка обновления события:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    async deleteEvent(eventId) {
        try {
            const response = await this.auth.makeAuthenticatedRequest(`/api/events/${eventId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                // Удаляем событие из локального массива
                this.events = this.events.filter(e => e.id !== eventId);
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Ошибка удаления события:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    canEditEvent(event) {
        return this.auth.user && event.createdBy === this.auth.user.id;
    }

    getEventsByUser(userId = null) {
        const targetUserId = userId || this.auth.user?.id;
        return this.events.filter(event => event.createdBy === targetUserId);
    }

    getUpcomingEvents() {
        const now = new Date();
        return this.events
            .filter(event => new Date(event.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getEventsByDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.events.filter(event => new Date(event.date).toDateString() === targetDate);
    }
}

// Глобальные экземпляры
window.authManager = new AuthManager();
window.eventManager = new EventManager(window.authManager);

// Показываем текущий режим работы
console.log('🌐 Режим работы:', window.authManager.baseURL);
console.log('📍 Для смены сервера измените URL в методе getBaseURL()');

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, EventManager };
}
