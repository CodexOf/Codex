// Система авторизации для Codex - ИСПРАВЛЕННАЯ ДЛЯ GITHUB PAGES + RENDER.COM
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = this.getCurrentUser();
        this.baseURL = this.getBaseURL();
        this.serverWakeupTime = 60000; // 60 секунд на пробуждение сервера
        this.isGitHubPages = window.location.hostname.includes('github.io');
    }

    getBaseURL() {
        // Определяем базовый URL для API
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `http://${window.location.hostname}:3000`;
        }
        
        // Для GitHub Pages всегда используем Render.com
        if (this.isGitHubPages) {
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

    // Специальная функция для "пробуждения" Render.com сервера (без проблемных заголовков)
    async wakeUpServer() {
        console.log('⏰ Пробуждение сервера Render.com...');
        const startTime = Date.now();
        
        try {
            // Простой запрос без проблемных заголовков
            const response = await fetch(this.baseURL, {
                method: 'GET'
                // Убираем cache-control и pragma для GitHub Pages
            });
            
            const endTime = Date.now();
            const wakeupTime = endTime - startTime;
            
            console.log(`✅ Сервер проснулся за ${wakeupTime}ms`);
            
            // Даем серверу дополнительное время для полной инициализации
            if (wakeupTime > 5000) {
                console.log('⏳ Ожидание полной инициализации сервера...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
            return true;
        } catch (error) {
            console.error('❌ Ошибка пробуждения сервера:', error);
            return false;
        }
    }

    async makeAuthenticatedRequest(url, options = {}) {
        // Используем минимальный набор заголовков для совместимости с GitHub Pages
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Добавляем cache-control только если НЕ GitHub Pages
        if (!this.isGitHubPages) {
            headers['Cache-Control'] = 'no-cache';
            headers['Pragma'] = 'no-cache';
        }

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        let lastError = null;
        
        // Пытаемся выполнить запрос с retry логикой для Render.com
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`📡 Попытка ${attempt}/3: ${url}`);
                
                const response = await fetch(`${this.baseURL}${url}`, {
                    ...options,
                    headers,
                    timeout: 30000 // 30 секунд таймаут
                });

                // Если токен недействителен, выходим из системы
                if (response.status === 401 && url !== '/api/user') {
                    console.log('🚫 Токен недействителен, выполняется выход');
                    this.logout();
                    throw new Error('Сессия истекла. Необходимо войти снова.');
                }

                if (response.ok || response.status === 401) {
                    console.log(`✅ Запрос выполнен, статус: ${response.status}`);
                    return response;
                }

                // Если сервер возвращает 502/503, возможно он спит
                if ((response.status === 502 || response.status === 503) && attempt === 1) {
                    console.log('💤 Сервер может спать, пробуждаем...');
                    await this.wakeUpServer();
                    continue;
                }

                lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);

            } catch (error) {
                lastError = error;
                
                // Проверяем, является ли это CORS ошибкой
                if (error.message.includes('CORS') || error.message.includes('blocked')) {
                    console.log('🔄 CORS ошибка обнаружена, пробуждаем сервер...');
                    await this.wakeUpServer();
                    continue;
                }
                
                // Если это первая попытка и ошибка связана с сетью
                if (attempt === 1 && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                    console.log('🔄 Сетевая ошибка, возможно сервер спит. Пробуждаем...');
                    const wakeupSuccess = await this.wakeUpServer();
                    if (wakeupSuccess) {
                        continue; // Повторяем запрос после пробуждения
                    }
                }

                // Короткая пауза перед повтором
                if (attempt < 3) {
                    console.log(`⏳ Пауза перед повтором...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        throw lastError;
    }

    async login(username, password) {
        try {
            console.log('🔑 Попытка входа на сервер:', this.baseURL);
            console.log('👤 Пользователь:', username);
            console.log('🌐 GitHub Pages режим:', this.isGitHubPages);
            
            // Проверяем, не спит ли сервер перед логином
            const serverAwake = await this.checkServerHealth();
            if (!serverAwake) {
                await this.wakeUpServer();
            }
            
            // Минимальный набор заголовков для GitHub Pages
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Добавляем cache-control только если НЕ GitHub Pages
            if (!this.isGitHubPages) {
                headers['Cache-Control'] = 'no-cache';
                headers['Pragma'] = 'no-cache';
            }
            
            const response = await fetch(`${this.baseURL}/api/login`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ username, password })
            });

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('❌ Ошибка парсинга ответа сервера:', parseError);
                return { 
                    success: false, 
                    error: 'Сервер вернул некорректный ответ. Возможно, сервер еще запускается.' 
                };
            }
            
            console.log('📊 Ответ сервера:', {
                status: response.status,
                success: data.success,
                error: data.error
            });

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                
                console.log('✅ Вход выполнен успешно');
                console.log('👤 Пользователь:', this.user.username);
                console.log('🎫 Токен сохранен');
                
                return { success: true, user: this.user };
            } else {
                console.log('❌ Ошибка входа:', data.error);
                
                // Специальные сообщения для типичных проблем Render.com
                if (response.status >= 500) {
                    return { 
                        success: false, 
                        error: 'Сервер временно недоступен. Попробуйте через 30-60 секунд.' 
                    };
                }
                
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('💥 Критическая ошибка входа:', error);
            
            if (error.message.includes('CORS')) {
                return { 
                    success: false, 
                    error: 'Проблема с CORS. Сервер пробуждается, попробуйте через 30-60 секунд.' 
                };
            }
            
            if (error.name === 'TypeError' || error.message.includes('fetch')) {
                return { 
                    success: false, 
                    error: 'Сервер недоступен. Проверьте подключение к интернету или попробуйте позже.' 
                };
            }
            
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    async register(username, password) {
        try {
            console.log('📝 Попытка регистрации на сервер:', this.baseURL);
            console.log('👤 Новый пользователь:', username);
            console.log('🌐 GitHub Pages режим:', this.isGitHubPages);
            
            // Проверяем, не спит ли сервер перед регистрацией
            const serverAwake = await this.checkServerHealth();
            if (!serverAwake) {
                await this.wakeUpServer();
            }
            
            // Минимальный набор заголовков для GitHub Pages
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Добавляем cache-control только если НЕ GitHub Pages
            if (!this.isGitHubPages) {
                headers['Cache-Control'] = 'no-cache';
                headers['Pragma'] = 'no-cache';
            }
            
            const response = await fetch(`${this.baseURL}/api/register`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ username, password })
            });

            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                console.error('❌ Ошибка парсинга ответа сервера:', parseError);
                return { 
                    success: false, 
                    error: 'Сервер вернул некорректный ответ. Возможно, сервер еще запускается.' 
                };
            }
            
            console.log('📊 Ответ сервера:', {
                status: response.status,
                success: data.success,
                error: data.error
            });

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.user));
                
                console.log('✅ Регистрация выполнена успешно');
                console.log('👤 Новый пользователь:', this.user.username);
                console.log('🎫 Токен сохранен');
                
                return { success: true, user: this.user };
            } else {
                console.log('❌ Ошибка регистрации:', data.error);
                
                // Специальные сообщения для типичных проблем Render.com
                if (response.status >= 500) {
                    return { 
                        success: false, 
                        error: 'Сервер временно недоступен. Попробуйте через 30-60 секунд.' 
                    };
                }
                
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('💥 Критическая ошибка регистрации:', error);
            
            if (error.message.includes('CORS')) {
                return { 
                    success: false, 
                    error: 'Проблема с CORS. Сервер пробуждается, попробуйте через 30-60 секунд.' 
                };
            }
            
            if (error.name === 'TypeError' || error.message.includes('fetch')) {
                return { 
                    success: false, 
                    error: 'Сервер недоступен. Проверьте подключение к интернету или попробуйте позже.' 
                };
            }
            
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
            
            console.log('🚪 Выход выполнен, данные очищены');
            
            // Перенаправляем на страницу авторизации
            window.location.href = 'auth.html';
        }
    }

    async checkServerHealth() {
        try {
            const response = await fetch(this.baseURL, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async verifyToken() {
        if (!this.token) {
            console.log('🔍 Токен отсутствует');
            return false;
        }

        try {
            console.log('🔍 Проверка токена...');
            
            const response = await this.makeAuthenticatedRequest('/api/user', {
                method: 'GET'
            });
            
            if (response.status === 401) {
                console.log('❌ Токен недействителен');
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
                    console.log('✅ Токен действителен, пользователь:', data.user.username);
                    return true;
                }
            }
            
            console.log('❌ Неожиданный ответ сервера');
            return false;
        } catch (error) {
            console.error('💥 Ошибка проверки токена:', error);
            return false;
        }
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            console.log('🚫 Требуется авторизация, перенаправление...');
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
            console.log('📅 Загрузка событий...');
            const response = await this.auth.makeAuthenticatedRequest('/api/events');
            const data = await response.json();
            
            if (Array.isArray(data)) {
                this.events = data;
                console.log(`✅ Загружено ${data.length} событий`);
                return this.events;
            } else {
                throw new Error('Неверный формат данных событий');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки событий:', error);
            throw error;
        }
    }

    async createEvent(eventData) {
        try {
            console.log('➕ Создание события:', eventData.title);
            const response = await this.auth.makeAuthenticatedRequest('/api/events', {
                method: 'POST',
                body: JSON.stringify(eventData)
            });

            const data = await response.json();
            
            if (data.success) {
                this.events.push(data.event);
                console.log('✅ Событие создано:', data.event.title);
                return { success: true, event: data.event };
            } else {
                console.log('❌ Ошибка создания события:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('💥 Критическая ошибка создания события:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    async updateEvent(eventId, eventData) {
        try {
            console.log('✏️ Обновление события:', eventId);
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
                console.log('✅ Событие обновлено:', data.event.title);
                return { success: true, event: data.event };
            } else {
                console.log('❌ Ошибка обновления события:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('💥 Критическая ошибка обновления события:', error);
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    async deleteEvent(eventId) {
        try {
            console.log('🗑️ Удаление события:', eventId);
            const response = await this.auth.makeAuthenticatedRequest(`/api/events/${eventId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                // Удаляем событие из локального массива
                this.events = this.events.filter(e => e.id !== eventId);
                console.log('✅ Событие удалено');
                return { success: true };
            } else {
                console.log('❌ Ошибка удаления события:', data.error);
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('💥 Критическая ошибка удаления события:', error);
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
console.log('📍 GitHub Pages режим:', window.authManager.isGitHubPages);
console.log('📍 Для смены сервера измените URL в методе getBaseURL()');

// Проверяем статус сервера при загрузке
async function checkServerStatus() {
    try {
        console.log('🔍 Проверка статуса сервера...');
        
        const isHealthy = await window.authManager.checkServerHealth();
        
        if (isHealthy) {
            console.log('✅ Сервер доступен:', window.authManager.baseURL);
        } else {
            console.log('💤 Сервер может спать, пробуждаем...');
            await window.authManager.wakeUpServer();
        }
    } catch (error) {
        console.error('❌ Ошибка проверки сервера:', error);
        console.log('💡 Если проблемы продолжаются, попробуйте:');
        console.log('   1. Обновить страницу через 30-60 секунд');
        console.log('   2. Проверить подключение к интернету');
        console.log('   3. Убедиться, что сервер не превысил лимиты Render.com');
    }
}

// Запускаем проверку через секунду после загрузки
setTimeout(checkServerStatus, 1000);

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, EventManager };
}