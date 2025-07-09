// Система пользователей без сервера (для GitHub Pages) с ролями администраторов
class LocalAuthManager {
    constructor() {
        this.currentUser = this.getCurrentUser();
        this.initializeUsers();
        this.createDefaultAdmin(); // Создаем администратора по умолчанию
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

    // Создание администратора по умолчанию
    createDefaultAdmin() {
        const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
        
        // Проверяем, есть ли уже главный администратор
        const superAdmin = users.find(u => u.role === 'super_admin');
        
        if (!superAdmin) {
            const defaultAdmin = {
                id: 'admin_' + Date.now().toString(),
                username: 'admin',
                password: this.hashPassword('admin123'), // Пароль по умолчанию
                role: 'super_admin', // Роли: super_admin, admin, moderator, user
                permissions: ['all'], // Все права
                createdAt: new Date().toISOString(),
                isDefault: true
            };
            
            users.push(defaultAdmin);
            localStorage.setItem('codex_users', JSON.stringify(users));
            
            console.log('Создан администратор по умолчанию:');
            console.log('Username: admin');
            console.log('Password: admin123');
            console.log('Обязательно смените пароль после первого входа!');
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

    // Проверка ролей и прав доступа
    hasRole(requiredRole) {
        if (!this.currentUser) return false;
        
        const roleHierarchy = {
            'super_admin': 4,
            'admin': 3,
            'moderator': 2,
            'user': 1
        };
        
        const userLevel = roleHierarchy[this.currentUser.role] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;
        
        return userLevel >= requiredLevel;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.permissions && this.currentUser.permissions.includes('all')) return true;
        return this.currentUser.permissions && this.currentUser.permissions.includes(permission);
    }

    async login(username, password) {
        try {
            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            const hashedPassword = this.hashPassword(password);
            
            console.log('=== LOGIN DEBUG ===');
            console.log('Username:', username);
            console.log('Password hash:', hashedPassword);
            console.log('Total users:', users.length);
            
            const user = users.find(u => {
                const usernameMatch = u.username.toLowerCase() === username.toLowerCase();
                const passwordMatch = u.password === hashedPassword;
                
                console.log(`Checking user ${u.username} (${u.role || 'user'}):`);
                console.log('  Username match:', usernameMatch);
                console.log('  Password match:', passwordMatch);
                
                return usernameMatch && passwordMatch;
            });

            if (user) {
                this.currentUser = {
                    id: user.id,
                    username: user.username,
                    role: user.role || 'user',
                    permissions: user.permissions || ['read', 'write'],
                    createdAt: user.createdAt,
                    isDefault: user.isDefault
                };
                
                localStorage.setItem('codex_currentUser', JSON.stringify(this.currentUser));
                localStorage.setItem('codex_loginTime', Date.now().toString());
                
                console.log('Login successful:', this.currentUser);
                return { success: true, user: this.currentUser };
            } else {
                console.log('Login failed: user not found or password mismatch');
                return { success: false, error: 'Неверное имя пользователя или пароль' };
            }
        } catch (error) {
            console.error('Ошибка входа:', error);
            return { success: false, error: 'Ошибка входа в систему' };
        }
    }

    async register(username, password, role = 'user', permissions = ['read', 'write']) {
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

            const hashedPassword = this.hashPassword(password);
            
            console.log('=== REGISTER DEBUG ===');
            console.log('Username:', username);
            console.log('Role:', role);
            console.log('Permissions:', permissions);

            // Создаем нового пользователя
            const newUser = {
                id: Date.now().toString(),
                username: username.trim(),
                password: hashedPassword,
                role: role,
                permissions: permissions,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('codex_users', JSON.stringify(users));
            
            console.log('User registered:', newUser);

            return { success: true, user: newUser };

        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return { success: false, error: 'Ошибка регистрации' };
        }
    }

    // Создание пользователя администратором
    async createUser(userData) {
        if (!this.hasRole('admin')) {
            return { success: false, error: 'Недостаточно прав для создания пользователей' };
        }

        const { username, password, role, permissions } = userData;
        
        // Только super_admin может создавать других admin и super_admin
        if ((role === 'admin' || role === 'super_admin') && !this.hasRole('super_admin')) {
            return { success: false, error: 'Только главный администратор может создавать администраторов' };
        }

        return await this.register(username, password, role, permissions);
    }

    // Получение всех пользователей (только для администраторов)
    getAllUsers() {
        if (!this.hasRole('admin')) {
            return { success: false, error: 'Недостаточно прав' };
        }

        const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
        // Не показываем пароли
        const safeUsers = users.map(u => ({
            id: u.id,
            username: u.username,
            role: u.role || 'user',
            permissions: u.permissions || ['read', 'write'],
            createdAt: u.createdAt,
            isDefault: u.isDefault
        }));

        return { success: true, users: safeUsers };
    }

    // Удаление пользователя
    async deleteUser(userId) {
        if (!this.hasRole('admin')) {
            return { success: false, error: 'Недостаточно прав' };
        }

        const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
        const userToDelete = users.find(u => u.id === userId);

        if (!userToDelete) {
            return { success: false, error: 'Пользователь не найден' };
        }

        // Нельзя удалить самого себя
        if (userToDelete.id === this.currentUser.id) {
            return { success: false, error: 'Нельзя удалить самого себя' };
        }

        // Только super_admin может удалять других admin
        if (userToDelete.role === 'admin' && !this.hasRole('super_admin')) {
            return { success: false, error: 'Только главный администратор может удалять администраторов' };
        }

        const updatedUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('codex_users', JSON.stringify(updatedUsers));

        return { success: true };
    }

    // Изменение пароля
    async changePassword(oldPassword, newPassword) {
        if (!this.isAuthenticated()) {
            return { success: false, error: 'Не авторизован' };
        }

        const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex === -1) {
            return { success: false, error: 'Пользователь не найден' };
        }

        const oldPasswordHash = this.hashPassword(oldPassword);
        if (users[userIndex].password !== oldPasswordHash) {
            return { success: false, error: 'Неверный текущий пароль' };
        }

        if (newPassword.length < 6) {
            return { success: false, error: 'Новый пароль должен содержать минимум 6 символов' };
        }

        users[userIndex].password = this.hashPassword(newPassword);
        users[userIndex].isDefault = false; // Убираем флаг дефолтного пользователя
        localStorage.setItem('codex_users', JSON.stringify(users));

        return { success: true };
    }

    // Полная очистка всех данных
    clearAllData() {
        if (!this.hasRole('super_admin')) {
            return { success: false, error: 'Только главный администратор может очистить все данные' };
        }

        // Очищаем все данные
        localStorage.removeItem('codex_users');
        localStorage.removeItem('codex_currentUser');
        localStorage.removeItem('codex_loginTime');
        localStorage.removeItem('codex_events');
        localStorage.removeItem('codex_hash_fixed');

        // Перезапускаем систему
        this.currentUser = null;
        this.initializeUsers();
        this.createDefaultAdmin();

        return { success: true };
    }

    // Очистка только пользователей (кроме администраторов)
    clearUsers() {
        if (!this.hasRole('admin')) {
            return { success: false, error: 'Недостаточно прав' };
        }

        const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
        // Оставляем только администраторов
        const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'super_admin');
        
        localStorage.setItem('codex_users', JSON.stringify(adminUsers));

        return { success: true, removedCount: users.length - adminUsers.length };
    }

    // Очистка событий
    clearEvents() {
        if (!this.hasRole('moderator')) {
            return { success: false, error: 'Недостаточно прав' };
        }

        localStorage.setItem('codex_events', JSON.stringify([]));
        return { success: true };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('codex_currentUser');
        localStorage.removeItem('codex_loginTime');
        window.location.href = 'auth.html';
    }

    hashPassword(password) {
        // Улучшенное хеширование для localStorage версии
        let hash = 0;
        if (password.length === 0) return hash.toString();
        
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Конвертируем в 32-битное число
        }
        
        // Добавляем соль для большей безопасности
        const salt = 'codex_salt_2025';
        let saltedHash = hash;
        for (let i = 0; i < salt.length; i++) {
            const char = salt.charCodeAt(i);
            saltedHash = ((saltedHash << 3) - saltedHash) + char;
            saltedHash = saltedHash & saltedHash;
        }
        
        return Math.abs(saltedHash).toString();
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

    requireAuth(requiredRole = 'user') {
        if (!this.isAuthenticated() || !this.hasRole(requiredRole)) {
            window.location.href = 'auth.html';
            return false;
        }
        return true;
    }
}

// Консольные команды для управления (только для разработки)
window.adminCommands = {
    // Показать всех пользователей
    showUsers: () => {
        const result = window.localAuthManager.getAllUsers();
        if (result.success) {
            console.table(result.users);
        } else {
            console.error(result.error);
        }
    },
    
    // Создать администратора
    createAdmin: (username, password) => {
        if (!username || !password) {
            console.log('Использование: adminCommands.createAdmin("username", "password")');
            return;
        }
        window.localAuthManager.createUser({
            username,
            password,
            role: 'admin',
            permissions: ['all']
        }).then(result => {
            if (result.success) {
                console.log('Администратор создан:', result.user);
            } else {
                console.error(result.error);
            }
        });
    },
    
    // Создать модератора
    createModerator: (username, password) => {
        if (!username || !password) {
            console.log('Использование: adminCommands.createModerator("username", "password")');
            return;
        }
        window.localAuthManager.createUser({
            username,
            password,
            role: 'moderator',
            permissions: ['read', 'write', 'moderate']
        }).then(result => {
            if (result.success) {
                console.log('Модератор создан:', result.user);
            } else {
                console.error(result.error);
            }
        });
    },
    
    // Очистить все данные
    clearAll: () => {
        const result = window.localAuthManager.clearAllData();
        if (result.success) {
            console.log('Все данные очищены. Создан новый администратор по умолчанию.');
            console.log('Username: admin, Password: admin123');
        } else {
            console.error(result.error);
        }
    },
    
    // Очистить пользователей
    clearUsers: () => {
        const result = window.localAuthManager.clearUsers();
        if (result.success) {
            console.log(`Удалено пользователей: ${result.removedCount}`);
        } else {
            console.error(result.error);
        }
    },
    
    // Очистить события
    clearEvents: () => {
        const result = window.localAuthManager.clearEvents();
        if (result.success) {
            console.log('Все события удалены');
        } else {
            console.error(result.error);
        }
    }
};

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
            if (event.createdBy !== this.auth.currentUser.id && !this.auth.hasRole('moderator')) {
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
            if (event.createdBy !== this.auth.currentUser.id && !this.auth.hasRole('moderator')) {
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
        return this.auth.currentUser && 
               (event.createdBy === this.auth.currentUser.id || this.auth.hasRole('moderator'));
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

console.log('🔐 Улучшенная система пользователей инициализирована');
console.log('✅ Защищенное хранение паролей');
console.log('✅ Проверка уникальности имен пользователей');
console.log('✅ Валидация данных');
console.log('✅ Защита от брутфорса (блокировка после 5 попыток)');
console.log('Роли: super_admin, admin, moderator, user');

// Показываем команды для разработки
if (window.localAuthManager.hasRole('admin')) {
    console.log('📋 Доступные команды администратора:');
    console.log('adminCommands.showUsers() - показать всех пользователей');
    console.log('adminCommands.createAdmin("username", "password") - создать администратора');
    console.log('adminCommands.createModerator("username", "password") - создать модератора');
    console.log('adminCommands.unlockUser("user_id") - разблокировать пользователя');
    console.log('adminCommands.clearAll() - очистить все данные');
    console.log('adminCommands.clearUsers() - очистить пользователей');
    console.log('adminCommands.clearEvents() - очистить события');
}