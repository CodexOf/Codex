// Улучшенная система авторизации с автоматическим восстановлением
class ImprovedAuthManager {
    constructor() {
        this.mode = this.detectOptimalMode();
        this.baseURL = this.getBaseURL();
        this.token = null;
        this.user = null;
        this.isInitialized = false;
        this.autoSync = null;
        this.healthChecker = null;
        
        this.initializeAuth();
    }

    async initializeAuth() {
        console.log('🚀 Инициализация улучшенной системы авторизации...');
        
        // Пытаемся восстановить сессию из любого доступного источника
        const recoveryResult = await this.attemptSessionRecovery();
        
        if (recoveryResult.success) {
            this.token = recoveryResult.token;
            this.user = recoveryResult.user;
            console.log('✅ Сессия восстановлена для пользователя:', this.user.username);
            
            // Проверяем актуальность токена на сервере
            const isValid = await this.verifyTokenOnServer();
            if (!isValid) {
                console.warn('⚠️ Токен устарел, требуется повторная авторизация');
                this.clearSession();
            } else {
                // Запускаем автоматическую синхронизацию
                this.startAutoSync();
            }
        } else {
            console.log('ℹ️ Активная сессия не найдена');
        }
        
        // Запускаем мониторинг сервера
        this.startHealthChecker();
        this.isInitialized = true;
    }

    detectOptimalMode() {
        // Определяем оптимальный режим работы
        const hostname = window.location.hostname;
        
        if (hostname.includes('github.io') || hostname.includes('onrender.com')) {
            return 'server'; // Продакшен - только сервер
        }
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'hybrid'; // Разработка - гибридный режим
        }
        
        return 'server'; // По умолчанию - сервер
    }

    getBaseURL() {
        switch (this.mode) {
            case 'server':
                return 'https://codex-of.onrender.com';
            case 'hybrid':
                // Сначала пробуем локальный сервер, потом удаленный
                return this.detectLocalServer() || 'https://codex-of.onrender.com';
            default:
                return window.location.origin;
        }
    }

    detectLocalServer() {
        // Синхронная проверка доступности локального сервера
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', `http://${window.location.hostname}:3000/api/user`, false);
            xhr.timeout = 1000;
            xhr.send();
            
            if (xhr.status !== 0) {
                return `http://${window.location.hostname}:3000`;
            }
        } catch (e) {
            // Локальный сервер недоступен
        }
        return null;
    }

    async attemptSessionRecovery() {
        console.log('🔄 Попытка восстановления сессии...');
        
        const strategies = [
            () => this.recoverFromPersistentStorage(),
            () => this.recoverFromServer(),
            () => this.recoverFromLegacyStorage()
        ];

        for (const strategy of strategies) {
            try {
                const result = await strategy();
                if (result.success) {
                    console.log('✅ Сессия восстановлена через:', strategy.name || 'стратегию');
                    
                    // Сохраняем восстановленные данные во всех хранилищах
                    this.saveSessionData(result.token, result.user);
                    return result;
                }
            } catch (error) {
                console.warn('⚠️ Стратегия восстановления не сработала:', error.message);
            }
        }

        return { success: false, error: 'Не удалось восстановить сессию' };
    }

    recoverFromPersistentStorage() {
        const token = PersistentStorage.getItem('authToken');
        const user = PersistentStorage.getItem('currentUser');
        
        if (token && user) {
            return { success: true, token, user };
        }
        
        return { success: false };
    }

    async recoverFromServer() {
        // Пытаемся восстановить сессию через сервер, если есть токен
        const token = PersistentStorage.getItem('authToken');
        if (!token) return { success: false };

        try {
            const response = await fetch(`${this.baseURL}/api/user`, {
                headers: { 'Authorization': `Bearer ${token}` },
                timeout: 5000
            });

            if (response.ok) {
                const data = await response.json();
                return { success: true, token, user: data.user };
            }
        } catch (error) {
            console.warn('Сервер недоступен для восстановления сессии');
        }

        return { success: false };
    }

    recoverFromLegacyStorage() {
        // Восстановление из старого формата хранения
        try {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('currentUser');
            
            if (token && userData) {
                const user = JSON.parse(userData);
                return { success: true, token, user };
            }
        } catch (error) {
            console.warn('Ошибка восстановления из legacy storage:', error);
        }
        
        return { success: false };
    }

    async verifyTokenOnServer() {
        if (!this.token) return false;

        try {
            const response = await fetch(`${this.baseURL}/api/user`, {
                headers: { 'Authorization': `Bearer ${this.token}` },
                timeout: 5000
            });

            if (response.ok) {
                const data = await response.json();
                // Обновляем данные пользователя, если они изменились
                if (JSON.stringify(data.user) !== JSON.stringify(this.user)) {
                    this.user = data.user;
                    this.saveSessionData(this.token, this.user);
                }
                return true;
            }
        } catch (error) {
            console.warn('Ошибка проверки токена:', error);
        }

        return false;
    }

    saveSessionData(token, user) {
        PersistentStorage.setItem('authToken', token);
        PersistentStorage.setItem('currentUser', user);
        PersistentStorage.setItem('lastLoginTime', Date.now());
    }

    clearSession() {
        this.token = null;
        this.user = null;
        
        PersistentStorage.removeItem('authToken');
        PersistentStorage.removeItem('currentUser');
        PersistentStorage.removeItem('lastLoginTime');
        
        if (this.autoSync) {
            this.autoSync.stop();
        }
    }

    isAuthenticated() {
        return !!(this.token && this.user);
    }

    getCurrentUser() {
        return this.user;
    }

    async makeAuthenticatedRequest(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                ...options,
                headers,
                timeout: 10000
            });

            // Если токен недействителен, пытаемся восстановить сессию
            if (response.status === 401) {
                console.warn('🔄 Токен недействителен, попытка восстановления...');
                
                const recovery = await this.attemptSessionRecovery();
                if (recovery.success) {
                    // Повторяем запрос с новым токеном
                    headers['Authorization'] = `Bearer ${recovery.token}`;
                    return fetch(`${this.baseURL}${url}`, { ...options, headers });
                } else {
                    this.clearSession();
                    throw new Error('Сессия истекла. Необходимо войти снова.');
                }
            }

            return response;
        } catch (error) {
            // Если сервер недоступен, пытаемся работать в офлайн режиме
            if (error.name === 'TypeError' || error.message.includes('fetch')) {
                console.warn('⚠️ Сервер недоступен, переключение в офлайн режим');
                return this.handleOfflineRequest(url, options);
            }
            throw error;
        }
    }

    async handleOfflineRequest(url, options) {
        // Обработка запросов в офлайн режиме
        console.log('📱 Обработка запроса в офлайн режиме:', url);
        
        // Для GET запросов пытаемся найти кешированные данные
        if (!options.method || options.method === 'GET') {
            const cacheKey = `cache_${url}`;
            const cachedData = PersistentStorage.getItem(cacheKey);
            
            if (cachedData) {
                console.log('📦 Найдены кешированные данные');
                return {
                    ok: true,
                    json: () => Promise.resolve(cachedData)
                };
            }
        }

        // Для POST/PUT/DELETE сохраняем в очередь для синхронизации
        if (['POST', 'PUT', 'DELETE'].includes(options.method)) {
            this.queueOfflineAction(url, options);
        }

        throw new Error('Сервер недоступен. Данные будут синхронизированы при восстановлении соединения.');
    }

    queueOfflineAction(url, options) {
        const queue = PersistentStorage.getItem('offlineQueue') || [];
        queue.push({
            url,
            options,
            timestamp: Date.now(),
            id: Date.now().toString()
        });
        PersistentStorage.setItem('offlineQueue', queue);
        console.log('📝 Действие добавлено в очередь офлайн синхронизации');
    }

    async processOfflineQueue() {
        const queue = PersistentStorage.getItem('offlineQueue') || [];
        if (queue.length === 0) return;

        console.log(`🔄 Обработка ${queue.length} действий из офлайн очереди...`);
        
        const processed = [];
        const failed = [];

        for (const action of queue) {
            try {
                const response = await fetch(`${this.baseURL}${action.url}`, action.options);
                if (response.ok) {
                    processed.push(action.id);
                    console.log('✅ Офлайн действие синхронизировано:', action.url);
                } else {
                    failed.push(action);
                }
            } catch (error) {
                failed.push(action);
                console.warn('❌ Ошибка синхронизации офлайн действия:', error);
            }
        }

        // Обновляем очередь, оставляя только неудачные попытки
        PersistentStorage.setItem('offlineQueue', failed);
        
        if (processed.length > 0) {
            console.log(`✅ Синхронизировано ${processed.length} действий`);
        }
        
        if (failed.length > 0) {
            console.warn(`⚠️ Не удалось синхронизировать ${failed.length} действий`);
        }
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                timeout: 10000
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                this.saveSessionData(this.token, this.user);
                this.startAutoSync();
                
                console.log('✅ Вход выполнен успешно для:', this.user.username);
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            
            // В офлайн режиме проверяем локальную базу
            if (this.mode === 'hybrid') {
                return this.loginOffline(username, password);
            }
            
            return { success: false, error: 'Ошибка подключения к серверу' };
        }
    }

    loginOffline(username, password) {
        // Проверка в локальной базе данных
        try {
            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            const user = users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                u.password === this.hashPassword(password)
            );

            if (user) {
                this.token = 'offline_' + Date.now();
                this.user = {
                    id: user.id,
                    username: user.username,
                    mode: 'offline'
                };
                
                this.saveSessionData(this.token, this.user);
                console.log('✅ Офлайн вход выполнен для:', this.user.username);
                return { success: true, user: this.user };
            }
        } catch (error) {
            console.error('Ошибка офлайн входа:', error);
        }

        return { success: false, error: 'Неверные учетные данные или отсутствует подключение' };
    }

    async register(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                timeout: 10000
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                
                this.saveSessionData(this.token, this.user);
                this.startAutoSync();
                
                console.log('✅ Регистрация выполнена для:', this.user.username);
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
            if (this.token && !this.token.startsWith('offline_')) {
                await this.makeAuthenticatedRequest('/api/logout', {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.error('Ошибка выхода:', error);
        } finally {
            this.clearSession();
            console.log('✅ Выход выполнен');
            
            // Перенаправляем на страницу авторизации
            if (window.location.pathname !== '/auth.html') {
                window.location.href = 'auth.html';
            }
        }
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            const currentPath = window.location.pathname;
            const returnTo = currentPath.includes('calendar') ? '?returnTo=calendar' : '';
            window.location.href = `auth.html${returnTo}`;
            return false;
        }
        return true;
    }

    startAutoSync() {
        if (this.autoSync) return; // Уже запущен

        this.autoSync = {
            interval: null,
            lastSync: 0,
            
            start: () => {
                console.log('🔄 Запуск автоматической синхронизации');
                
                // Синхронизация каждые 5 минут
                this.autoSync.interval = setInterval(() => {
                    this.syncData();
                }, 5 * 60 * 1000);

                // Синхронизация при фокусе на вкладке
                window.addEventListener('focus', () => {
                    if (Date.now() - this.autoSync.lastSync > 60000) {
                        this.syncData();
                    }
                });

                // Синхронизация при восстановлении соединения
                window.addEventListener('online', () => {
                    console.log('🌐 Соединение восстановлено');
                    this.syncData();
                    this.processOfflineQueue();
                });
            },
            
            stop: () => {
                if (this.autoSync.interval) {
                    clearInterval(this.autoSync.interval);
                    this.autoSync.interval = null;
                    console.log('⏹️ Автоматическая синхронизация остановлена');
                }
            }
        };

        this.autoSync.start();
    }

    async syncData() {
        if (!this.isAuthenticated() || this.token.startsWith('offline_')) return;

        try {
            const isValid = await this.verifyTokenOnServer();
            if (isValid) {
                this.autoSync.lastSync = Date.now();
                PersistentStorage.setItem('lastSyncTime', this.autoSync.lastSync);
                console.log('🔄 Данные синхронизированы');
                
                // Обрабатываем очередь офлайн действий
                await this.processOfflineQueue();
            }
        } catch (error) {
            console.warn('⚠️ Ошибка синхронизации:', error.message);
        }
    }

    startHealthChecker() {
        this.healthChecker = {
            interval: null,
            lastCheck: 0,
            
            start: () => {
                // Проверка каждые 2 минуты
                this.healthChecker.interval = setInterval(() => {
                    this.checkServerHealth();
                }, 2 * 60 * 1000);
                
                // Первоначальная проверка
                this.checkServerHealth();
            },
            
            stop: () => {
                if (this.healthChecker.interval) {
                    clearInterval(this.healthChecker.interval);
                    this.healthChecker.interval = null;
                }
            }
        };

        this.healthChecker.start();
    }

    async checkServerHealth() {
        const startTime = Date.now();
        
        try {
            const response = await fetch(`${this.baseURL}/api/user`, {
                method: 'HEAD',
                timeout: 5000
            });
            
            const latency = Date.now() - startTime;
            const health = {
                online: response.ok || response.status === 401, // 401 означает что сервер работает
                latency,
                lastCheck: Date.now(),
                status: response.status
            };
            
            PersistentStorage.setItem('serverHealth', health);
            this.healthChecker.lastCheck = Date.now();
            
            if (health.online) {
                console.log(`✅ Сервер доступен (${latency}ms)`);
            } else {
                console.warn('⚠️ Сервер недоступен');
            }
            
        } catch (error) {
            const health = {
                online: false,
                latency: Infinity,
                lastCheck: Date.now(),
                error: error.message
            };
            
            PersistentStorage.setItem('serverHealth', health);
            console.warn('❌ Сервер недоступен:', error.message);
        }
    }

    getServerHealth() {
        return PersistentStorage.getItem('serverHealth') || {
            online: false,
            latency: Infinity,
            lastCheck: 0
        };
    }

    hashPassword(password) {
        // Простое хеширование для совместимости со старой системой
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Преобразуем в 32-битное число
        }
        return hash.toString();
    }

    // Диагностические методы
    async getDiagnostics() {
        const diagnostics = {
            mode: this.mode,
            baseURL: this.baseURL,
            isAuthenticated: this.isAuthenticated(),
            user: this.user ? { id: this.user.id, username: this.user.username } : null,
            serverHealth: this.getServerHealth(),
            storageInfo: await PersistentStorage.getStorageInfo(),
            offlineQueue: PersistentStorage.getItem('offlineQueue') || [],
            lastSync: PersistentStorage.getItem('lastSyncTime'),
            isInitialized: this.isInitialized
        };

        return diagnostics;
    }

    async runDiagnostics() {
        console.log('🔍 Запуск диагностики системы авторизации...');
        
        const diagnostics = await this.getDiagnostics();
        
        console.log('📊 Результаты диагностики:');
        console.table(diagnostics);
        
        // Тестируем хранилища
        const storageTest = await PersistentStorage.testAllSystems();
        console.log('💾 Тест систем хранения:', storageTest);
        
        return { diagnostics, storageTest };
    }
}

// Экспорт для глобального использования
window.ImprovedAuthManager = ImprovedAuthManager;

console.log('✅ Улучшенная система авторизации загружена');
console.log('💡 Используйте authManager.runDiagnostics() для полной диагностики');
