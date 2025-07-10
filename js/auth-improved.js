// Интегрированная улучшенная система авторизации для Codex
// Этот файл заменяет auth.js и обеспечивает полную совместимость

// Подключаем компоненты
console.log('🚀 Загрузка улучшенной системы авторизации Codex...');

// Ждем загрузки всех компонентов
Promise.all([
    new Promise(resolve => {
        if (window.PersistentStorage) {
            resolve();
        } else {
            const script = document.createElement('script');
            script.src = 'js/improved/persistent-storage.js';
            script.onload = resolve;
            document.head.appendChild(script);
        }
    }),
    new Promise(resolve => {
        if (window.ImprovedAuthManager) {
            resolve();
        } else {
            const script = document.createElement('script');
            script.src = 'js/improved/improved-auth.js';
            script.onload = resolve;
            document.head.appendChild(script);
        }
    }),
    new Promise(resolve => {
        if (window.ImprovedEventManager) {
            resolve();
        } else {
            const script = document.createElement('script');
            script.src = 'js/improved/improved-event-manager.js';
            script.onload = resolve;
            document.head.appendChild(script);
        }
    })
]).then(() => {
    initializeImprovedSystem();
}).catch(error => {
    console.error('❌ Ошибка загрузки компонентов:', error);
    // Fallback на старую систему
    initializeLegacySystem();
});

function initializeImprovedSystem() {
    console.log('✅ Все компоненты загружены, инициализация улучшенной системы...');
    
    // Создаем глобальные экземпляры с улучшенной функциональностью
    window.authManager = new ImprovedAuthManager();
    window.eventManager = new ImprovedEventManager(window.authManager);
    
    // Совместимость со старым API
    createLegacyCompatibilityLayer();
    
    // Автоматическое управление
    setupAutomaticManagement();
    
    console.log('🎉 Улучшенная система авторизации готова к работе!');
    console.log('💡 Теперь ваши данные сохраняются надежно и не теряются при очистке браузера');
    
    // Показываем статистику пользователю
    showUserFriendlyStatus();
}

function initializeLegacySystem() {
    console.warn('⚠️ Загрузка резервной системы авторизации...');
    
    // Простая система авторизации для совместимости
    class LegacyAuthManager {
        constructor() {
            this.token = localStorage.getItem('authToken');
            this.user = this.getCurrentUser();
            this.baseURL = this.getBaseURL();
        }

        getBaseURL() {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return `http://${window.location.hostname}:3000`;
            }
            if (window.location.hostname.includes('github.io')) {
                return 'https://codex-of.onrender.com';
            }
            return window.location.origin;
        }

        getCurrentUser() {
            try {
                const userData = localStorage.getItem('currentUser');
                return userData ? JSON.parse(userData) : null;
            } catch (error) {
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

            if (response.status === 401) {
                this.logout();
                throw new Error('Сессия истекла. Необходимо войти снова.');
            }

            return response;
        }

        async login(username, password) {
            try {
                const response = await fetch(`${this.baseURL}/api/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                return { success: false, error: 'Ошибка подключения к серверу' };
            }
        }

        async register(username, password) {
            try {
                const response = await fetch(`${this.baseURL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
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
                return { success: false, error: 'Ошибка подключения к серверу' };
            }
        }

        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'auth.html';
        }

        requireAuth() {
            if (!this.isAuthenticated()) {
                window.location.href = 'auth.html';
                return false;
            }
            return true;
        }
    }

    // Простой менеджер событий
    class LegacyEventManager {
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
                }
            } catch (error) {
                console.error('Ошибка загрузки событий:', error);
            }
            return [];
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

    window.authManager = new LegacyAuthManager();
    window.eventManager = new LegacyEventManager(window.authManager);
    
    console.log('⚠️ Резервная система авторизации активирована');
}

function createLegacyCompatibilityLayer() {
    // Обеспечиваем совместимость со старым API
    
    // Дублируем методы в старом стиле для совместимости
    if (window.authManager.getCurrentUser) {
        window.authManager.user = window.authManager.getCurrentUser();
    }
    
    // Добавляем недостающие методы для полной совместимости
    if (!window.authManager.verifyToken) {
        window.authManager.verifyToken = async function() {
            return await this.verifyTokenOnServer();
        };
    }

    // Добавляем старые методы EventManager, если их нет
    if (!window.eventManager.updateEvent) {
        window.eventManager.updateEvent = async function(eventId, eventData) {
            return await this.updateEvent(eventId, eventData);
        };
    }

    if (!window.eventManager.deleteEvent) {
        window.eventManager.deleteEvent = async function(eventId) {
            return await this.deleteEvent(eventId);
        };
    }
}

function setupAutomaticManagement() {
    // Автоматическое управление системой
    
    // Автоматическая очистка старых данных раз в день
    const lastCleanup = PersistentStorage.getItem('lastCleanup') || 0;
    const daysSinceCleanup = (Date.now() - lastCleanup) / (24 * 60 * 60 * 1000);
    
    if (daysSinceCleanup > 1) {
        setTimeout(() => {
            performAutomaticCleanup();
        }, 5000); // Через 5 секунд после загрузки
    }

    // Автоматическое создание резервных копий
    if (window.eventManager && window.eventManager.createBackup) {
        setTimeout(() => {
            window.eventManager.createBackup();
        }, 10000); // Через 10 секунд после загрузки
    }

    // Восстановление данных при первом запуске улучшенной системы
    const isFirstRun = !PersistentStorage.getItem('improvedSystemInitialized');
    if (isFirstRun) {
        migrateFromLegacyStorage();
        PersistentStorage.setItem('improvedSystemInitialized', true);
    }

    // Слушатели событий браузера
    window.addEventListener('beforeunload', () => {
        // Создаем резервную копию перед закрытием
        if (window.eventManager && window.eventManager.createBackup) {
            window.eventManager.createBackup();
        }
    });

    window.addEventListener('online', () => {
        console.log('🌐 Соединение восстановлено');
        // Автоматическая синхронизация при восстановлении соединения
        if (window.authManager && window.authManager.syncData) {
            window.authManager.syncData();
        }
        if (window.eventManager && window.eventManager.processSyncQueue) {
            window.eventManager.processSyncQueue();
        }
    });

    window.addEventListener('offline', () => {
        console.log('📱 Переход в офлайн режим');
    });
}

function performAutomaticCleanup() {
    console.log('🧹 Выполнение автоматической очистки...');
    
    try {
        // Очистка старых событий (старше года)
        if (window.eventManager && window.eventManager.cleanupOldEvents) {
            const removed = window.eventManager.cleanupOldEvents(365);
            if (removed > 0) {
                console.log(`🗑️ Удалено ${removed} старых событий`);
            }
        }

        // Очистка старых сессий из cookies
        const expiredCookies = document.cookie.split(';').filter(cookie => {
            try {
                const name = cookie.split('=')[0].trim();
                if (name.startsWith('temp_') || name.startsWith('old_')) {
                    return true;
                }
            } catch (e) {}
            return false;
        });

        expiredCookies.forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        if (expiredCookies.length > 0) {
            console.log(`🍪 Удалено ${expiredCookies.length} устаревших cookies`);
        }

        PersistentStorage.setItem('lastCleanup', Date.now());
        console.log('✅ Автоматическая очистка завершена');

    } catch (error) {
        console.warn('⚠️ Ошибка автоматической очистки:', error);
    }
}

function migrateFromLegacyStorage() {
    console.log('🔄 Миграция данных из старого хранилища...');
    
    try {
        // Миграция токена авторизации
        const oldToken = localStorage.getItem('authToken');
        if (oldToken && !PersistentStorage.getItem('authToken')) {
            PersistentStorage.setItem('authToken', oldToken);
            console.log('✅ Токен авторизации перенесен');
        }

        // Миграция данных пользователя
        const oldUser = localStorage.getItem('currentUser');
        if (oldUser && !PersistentStorage.getItem('currentUser')) {
            try {
                const userData = JSON.parse(oldUser);
                PersistentStorage.setItem('currentUser', userData);
                console.log('✅ Данные пользователя перенесены');
            } catch (e) {
                console.warn('⚠️ Ошибка парсинга данных пользователя');
            }
        }

        // Миграция локальных пользователей
        const oldUsers = localStorage.getItem('codex_users');
        if (oldUsers && !PersistentStorage.getItem('codex_users')) {
            try {
                const usersData = JSON.parse(oldUsers);
                PersistentStorage.setItem('codex_users', usersData);
                console.log('✅ База пользователей перенесена');
            } catch (e) {
                console.warn('⚠️ Ошибка парсинга базы пользователей');
            }
        }

        // Миграция событий
        const oldEvents = localStorage.getItem('codex_events');
        if (oldEvents && !PersistentStorage.getItem('cachedEvents')) {
            try {
                const eventsData = JSON.parse(oldEvents);
                PersistentStorage.setItem('cachedEvents', eventsData);
                console.log('✅ События перенесены');
            } catch (e) {
                console.warn('⚠️ Ошибка парсинга событий');
            }
        }

        console.log('🎉 Миграция данных завершена успешно');

    } catch (error) {
        console.warn('⚠️ Ошибка миграции данных:', error);
    }
}

function showUserFriendlyStatus() {
    // Показываем пользователю статус системы в удобочитаемом виде
    
    setTimeout(async () => {
        try {
            const serverHealth = window.authManager.getServerHealth();
            const storageInfo = await PersistentStorage.getStorageInfo();
            
            let statusMessage = '🎯 Система Codex: ';
            
            if (serverHealth.online) {
                statusMessage += `Онлайн (${serverHealth.latency}ms)`;
            } else {
                statusMessage += 'Офлайн режим';
            }
            
            const storageCount = storageInfo.localStorage.items + 
                               storageInfo.sessionStorage.items + 
                               storageInfo.cookies.items + 
                               storageInfo.indexedDB.items;
            
            if (storageCount > 0) {
                statusMessage += ` | Данные сохранены в ${getStorageNames(storageInfo)}`;
            }
            
            console.log(statusMessage);
            
            // Показываем в UI, если есть элемент для статуса
            const statusElement = document.getElementById('system-status') || 
                                 document.querySelector('.system-status') ||
                                 document.querySelector('.server-status');
            
            if (statusElement) {
                statusElement.textContent = statusMessage;
                statusElement.style.display = 'block';
            }

        } catch (error) {
            console.warn('⚠️ Не удалось получить статус системы:', error);
        }
    }, 2000);
}

function getStorageNames(storageInfo) {
    const available = [];
    
    if (storageInfo.localStorage.available && storageInfo.localStorage.items > 0) {
        available.push('локальном хранилище');
    }
    if (storageInfo.sessionStorage.available && storageInfo.sessionStorage.items > 0) {
        available.push('сессии');
    }
    if (storageInfo.cookies.available && storageInfo.cookies.items > 0) {
        available.push('cookies');
    }
    if (storageInfo.indexedDB.available && storageInfo.indexedDB.items > 0) {
        available.push('базе данных');
    }
    
    if (available.length === 0) return 'памяти';
    if (available.length === 1) return available[0];
    if (available.length === 2) return available.join(' и ');
    
    return available.slice(0, -1).join(', ') + ' и ' + available[available.length - 1];
}

// Глобальные утилиты для отладки и диагностики
window.CodexDebug = {
    async runFullDiagnostics() {
        console.log('🔍 Запуск полной диагностики системы Codex...');
        
        if (window.authManager && window.authManager.runDiagnostics) {
            const authDiag = await window.authManager.runDiagnostics();
            console.log('🔐 Диагностика авторизации:', authDiag);
        }
        
        if (window.eventManager && window.eventManager.getEventStats) {
            const eventStats = window.eventManager.getEventStats();
            console.log('📅 Статистика событий:', eventStats);
        }
        
        if (window.PersistentStorage) {
            const storageTest = await PersistentStorage.testAllSystems();
            console.log('💾 Тест хранилищ:', storageTest);
        }
        
        console.log('✅ Полная диагностика завершена');
    },
    
    exportAllData() {
        const data = {
            user: window.authManager?.user,
            events: window.eventManager?.events,
            storageInfo: PersistentStorage?.getStorageInfo(),
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codex-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('📦 Данные экспортированы');
    },
    
    clearAllData() {
        if (confirm('⚠️ Это удалит ВСЕ данные Codex. Продолжить?')) {
            PersistentStorage?.clear();
            localStorage.clear();
            sessionStorage.clear();
            console.log('🧹 Все данные удалены');
            window.location.reload();
        }
    },
    
    enableDebugMode() {
        if (window.PersistentStorage) {
            PersistentStorage.enableDebug();
        }
        console.log('🔍 Режим отладки включен');
    }
};

// Экспорт для совместимости
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        AuthManager: window.ImprovedAuthManager || LegacyAuthManager, 
        EventManager: window.ImprovedEventManager || LegacyEventManager 
    };
}

console.log('🌟 Интегрированная система авторизации Codex загружена');
console.log('💡 Команды для отладки: CodexDebug.runFullDiagnostics(), CodexDebug.exportAllData()');
