const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Настройка CORS для работы с GitHub Pages
const corsOptions = {
    origin: function (origin, callback) {
        // Разрешаем запросы с GitHub Pages и локального сервера
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5000',
            'https://codexof.github.io',  // Ваш GitHub Pages
            'https://codex-of.onrender.com'  // Сам сервер
        ];
        
        // Разрешаем запросы без origin (например, Postman) в development
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // Проверяем точное совпадение или GitHub Pages
        if (!origin || allowedOrigins.includes(origin) || origin.includes('.github.io')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('.'));

// Пути к файлам данных
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const EVENTS_FILE = path.join(__dirname, 'data', 'events.json');
const SESSIONS_FILE = path.join(__dirname, 'data', 'sessions.json');

// Создание папки data если не существует
async function ensureDataDirectory() {
    try {
        await fs.access(path.join(__dirname, 'data'));
    } catch (error) {
        await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
    }
}

// Загрузка данных из файла
async function loadData(filePath, defaultData = []) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Если файл не существует, создаем его с дефолтными данными
        await saveData(filePath, defaultData);
        return defaultData;
    }
}

// Сохранение данных в файл
async function saveData(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Генерация сессионного токена
function generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Хеширование пароля
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Middleware для проверки авторизации
async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    
    const sessions = await loadData(SESSIONS_FILE, []);
    const session = sessions.find(s => s.token === token);
    
    if (!session || session.expiresAt < Date.now()) {
        return res.status(401).json({ error: 'Недействительная сессия' });
    }
    
    const users = await loadData(USERS_FILE, []);
    const user = users.find(u => u.id === session.userId);
    
    if (!user) {
        return res.status(401).json({ error: 'Пользователь не найден' });
    }
    
    req.user = user;
    next();
}

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
        }
        
        if (username.length < 3) {
            return res.status(400).json({ error: 'Имя пользователя должно содержать минимум 3 символа' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
        }
        
        const users = await loadData(USERS_FILE, []);
        
        // Проверяем, существует ли пользователь
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now().toString(),
            username: username.trim(),
            passwordHash: hashPassword(password),
            createdAt: new Date().toISOString(),
            isActive: true
        };
        
        users.push(newUser);
        await saveData(USERS_FILE, users);
        
        // Создаем сессию
        const token = generateSessionToken();
        const sessions = await loadData(SESSIONS_FILE, []);
        
        const newSession = {
            token,
            userId: newUser.id,
            createdAt: new Date().toISOString(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 дней
        };
        
        sessions.push(newSession);
        await saveData(SESSIONS_FILE, sessions);
        
        res.json({
            success: true,
            user: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.createdAt
            },
            token
        });
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
        }
        
        const users = await loadData(USERS_FILE, []);
        const user = users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.passwordHash === hashPassword(password) &&
            u.isActive
        );
        
        if (!user) {
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }
        
        // Создаем сессию
        const token = generateSessionToken();
        const sessions = await loadData(SESSIONS_FILE, []);
        
        // Удаляем старые сессии пользователя
        const filteredSessions = sessions.filter(s => s.userId !== user.id);
        
        const newSession = {
            token,
            userId: user.id,
            createdAt: new Date().toISOString(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 дней
        };
        
        filteredSessions.push(newSession);
        await saveData(SESSIONS_FILE, filteredSessions);
        
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt
            },
            token
        });
        
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Выход пользователя
app.post('/api/logout', requireAuth, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const sessions = await loadData(SESSIONS_FILE, []);
        
        // Удаляем сессию
        const filteredSessions = sessions.filter(s => s.token !== token);
        await saveData(SESSIONS_FILE, filteredSessions);
        
        res.json({ success: true, message: 'Выход выполнен успешно' });
        
    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Получение информации о текущем пользователе
app.get('/api/user', requireAuth, (req, res) => {
    res.json({
        user: {
            id: req.user.id,
            username: req.user.username,
            createdAt: req.user.createdAt
        }
    });
});

// Получение событий
app.get('/api/events', requireAuth, async (req, res) => {
    try {
        const events = await loadData(EVENTS_FILE, []);
        res.json(events);
    } catch (error) {
        console.error('Ошибка загрузки событий:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Создание события
app.post('/api/events', requireAuth, async (req, res) => {
    try {
        const eventData = req.body;
        
        if (!eventData.title || !eventData.date) {
            return res.status(400).json({ error: 'Название и дата события обязательны' });
        }
        
        const events = await loadData(EVENTS_FILE, []);
        
        const newEvent = {
            id: Date.now().toString(),
            ...eventData,
            createdBy: req.user.id,
            createdByUsername: req.user.username,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        events.push(newEvent);
        await saveData(EVENTS_FILE, events);
        
        res.json({ success: true, event: newEvent });
        
    } catch (error) {
        console.error('Ошибка создания события:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Обновление события
app.put('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.id;
        const updateData = req.body;
        
        const events = await loadData(EVENTS_FILE, []);
        const eventIndex = events.findIndex(e => e.id === eventId);
        
        if (eventIndex === -1) {
            return res.status(404).json({ error: 'Событие не найдено' });
        }
        
        const event = events[eventIndex];
        
        // Проверяем права доступа
        if (event.createdBy !== req.user.id) {
            return res.status(403).json({ error: 'Нет прав для редактирования этого события' });
        }
        
        // Обновляем событие
        events[eventIndex] = {
            ...event,
            ...updateData,
            id: eventId, // Сохраняем оригинальный ID
            createdBy: event.createdBy, // Сохраняем оригинального создателя
            createdByUsername: event.createdByUsername,
            createdAt: event.createdAt, // Сохраняем дату создания
            updatedAt: new Date().toISOString()
        };
        
        await saveData(EVENTS_FILE, events);
        
        res.json({ success: true, event: events[eventIndex] });
        
    } catch (error) {
        console.error('Ошибка обновления события:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Удаление события
app.delete('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.id;
        
        const events = await loadData(EVENTS_FILE, []);
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
            return res.status(404).json({ error: 'Событие не найдено' });
        }
        
        // Проверяем права доступа
        if (event.createdBy !== req.user.id) {
            return res.status(403).json({ error: 'Нет прав для удаления этого события' });
        }
        
        // Удаляем событие
        const filteredEvents = events.filter(e => e.id !== eventId);
        await saveData(EVENTS_FILE, filteredEvents);
        
        res.json({ success: true, message: 'Событие удалено' });
        
    } catch (error) {
        console.error('Ошибка удаления события:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Очистка просроченных сессий (запускается каждый час)
setInterval(async () => {
    try {
        const sessions = await loadData(SESSIONS_FILE, []);
        const activeSessions = sessions.filter(s => s.expiresAt > Date.now());
        await saveData(SESSIONS_FILE, activeSessions);
        console.log(`Очищено ${sessions.length - activeSessions.length} просроченных сессий`);
    } catch (error) {
        console.error('Ошибка очистки сессий:', error);
    }
}, 60 * 60 * 1000);

// Статичные файлы (для локальной разработки)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
async function startServer() {
    await ensureDataDirectory();
    
    app.listen(PORT, () => {
        console.log(`Сервер Codex запущен на http://localhost:${PORT}`);
        console.log('Доступные эндпоинты:');
        console.log('  POST /api/register - Регистрация');
        console.log('  POST /api/login - Авторизация');
        console.log('  POST /api/logout - Выход');
        console.log('  GET  /api/user - Информация о пользователе');
        console.log('  GET  /api/events - Получение событий');
        console.log('  POST /api/events - Создание события');
        console.log('  PUT  /api/events/:id - Обновление события');
        console.log('  DELETE /api/events/:id - Удаление события');
    });
}

startServer().catch(console.error);
