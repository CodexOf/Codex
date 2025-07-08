// Система пользователей без сервера (для GitHub Pages)
class LocalAuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.initializeUsers();
    }

    initializeUsers() {
        // Создаем базовую структуру пользователей если её нет
        if (!localStorage.getItem('codex_users')) {
            localStorage.setItem('codex_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('codex_events')) {
            localStorage.setItem('codex_events', JSON.stringify([]));
        }
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem('codex_currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Ошибка парсинга данных пользователя:', error);
            return null;
        }
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    async login(username, password) {
        try {
            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            const user = users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                u.password === this.hashPassword(password)
            );

            if (user) {
                this.currentUser = {
                    id: user.id,
                    username: user.username,
                    createdAt: user.createdAt
                };
                
                localStorage.setItem('codex_currentUser', JSON.stringify(this.currentUser));
                localStorage.setItem('codex_loginTime', Date.now().toString());
                
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, error: 'Неверное имя пользователя или пароль' };
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: 'Ошибка входа в систему' };
        }
    }

    async register(username, password) {
        try {
            if (username.length < 3) {
                return { success: false, error: 'Имя пользователя должно содержать минимум 3 символа' };
            }
            
            if (password.length < 6) {
                return { success: false, error: 'Пароль должен содержать минимум 6 символов' };
            }

            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            
            // Проверяем, существует ли пользователь
            if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
                return { success: false, error: 'Пользователь с таким именем уже существует' };
            }

            // Создаем нового пользователя
            const newUser = {
                id: Date.now().toString(),
                username: username.trim(),
                password: this.hashPassword(password),
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('codex_users', JSON.stringify(users));

            // Автоматически входим
            this.currentUser = {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.createdAt
            };
            
            localStorage.setItem('codex_currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('codex_loginTime', Date.now().toString());

            return { success: true, user: this.currentUser };

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { success: false, error: 'Ошибка регистрации' };
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('codex_currentUser');
        localStorage.removeItem('codex_loginTime');
        window.location.href = 'auth.html';
    }

    hashPassword(password) {
        // Простое хеширование для localStorage версии
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Конвертируем в 32-битное число
        }
        return hash.toString();
    }

    async verifyToken() {
        // Проверяем, не слишком ли давно был вход (7 дней)
        const loginTime = localStorage.getItem('codex_loginTime');
        if (loginTime) {
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - parseInt(loginTime) > sevenDays) {
                this.logout();
                return false;
            }
        }
        return this.isAuthenticated();
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }
}

// Система управления событиями без сервера
class LocalEventManager {
    constructor(authManager) {
        this.auth = authManager;
        this.events = [];
        this.loadEvents();
    }

    loadEvents() {
        try {
            const events = localStorage.getItem('codex_events');
            this.events = events ? JSON.parse(events) : [];
            return this.events;
        } catch (error) {
            console.error('Ошибка загрузки событий:', error);
            this.events = [];
            return this.events;
        }
    }

    saveEvents() {
        try {
            localStorage.setItem('codex_events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Ошибка сохранения событий:', error);
            throw error;
        }
    }

    async createEvent(eventData) {
        try {
            const newEvent = {
                id: Date.now().toString(),
                ...eventData,
                createdBy: this.auth.currentUser.id,
                createdByUsername: this.auth.currentUser.username,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.events.push(newEvent);
            this.saveEvents();

            return { success: true, event: newEvent };
        } catch (error) {
            console.error('Ошибка создания события:', error);
            return { success: false, error: 'Ошибка создания события' };
        }
    }

    async updateEvent(eventId, eventData) {
        try {
            const eventIndex = this.events.findIndex(e => e.id === eventId);
            
            if (eventIndex === -1) {
                return { success: false, error: 'Событие не найдено' };
            }

            const event = this.events[eventIndex];

            // Проверяем права доступа
            if (event.createdBy !== this.auth.currentUser.id) {
                return { success: false, error: 'Нет прав для редактирования этого события' };
            }

            // Обновляем событие
            this.events[eventIndex] = {
                ...event,
                ...eventData,
                id: eventId,
                createdBy: event.createdBy,
                createdByUsername: event.createdByUsername,
                createdAt: event.createdAt,
                updatedAt: new Date().toISOString()
            };

            this.saveEvents();

            return { success: true, event: this.events[eventIndex] };
        } catch (error) {
            console.error('Ошибка обновления события:', error);
            return { success: false, error: 'Ошибка обновления события' };
        }
    }

    async deleteEvent(eventId) {
        try {
            const event = this.events.find(e => e.id === eventId);
            
            if (!event) {
                return { success: false, error: 'Событие не найдено' };
            }

            // Проверяем права доступа
            if (event.createdBy !== this.auth.currentUser.id) {
                return { success: false, error: 'Нет прав для удаления этого события' };
            }

            // Удаляем событие
            this.events = this.events.filter(e => e.id !== eventId);
            this.saveEvents();

            return { success: true };
        } catch (error) {
            console.error('Ошибка удаления события:', error);
            return { success: false, error: 'Ошибка удаления события' };
        }
    }

    canEditEvent(event) {
        return this.auth.currentUser && event.createdBy === this.auth.currentUser.id;
    }

    getEventsByUser(userId = null) {
        const targetUserId = userId || this.auth.currentUser?.id;
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

// Глобальные экземпляры для localStorage версии
window.localAuthManager = new LocalAuthManager();
window.localEventManager = new LocalEventManager(window.localAuthManager);

// Совместимость с серверной версией
window.authManager = window.localAuthManager;
window.eventManager = window.localEventManager;

console.log('Локальная система пользователей инициализирована (без сервера)');
