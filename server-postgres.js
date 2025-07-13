require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка подключения к PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('.'));

// Создание таблиц при первом запуске
async function initializeDatabase() {
    try {
        // Таблица пользователей
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true
            )
        `);

        // Таблица сессий
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                token VARCHAR(255) PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        `);

        // Таблица событий
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                date DATE NOT NULL,
                time_start TIME,
                time_end TIME,
                color VARCHAR(7),
                participants TEXT[],
                created_by INTEGER REFERENCES users(id),
                created_by_username VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ База данных инициализирована');

        // Создаем тестового пользователя, если нет пользователей
        const usersResult = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(usersResult.rows[0].count) === 0) {
            await createDefaultUsers();
        }
    } catch (error) {
        console.error('Ошибка инициализации базы данных:', error);
        throw error;
    }
}

// Создание тестовых пользователей
async function createDefaultUsers() {
    console.log('👤 Создание тестовых пользователей...');
    
    const defaultUsers = [
        { username: 'admin', password: 'admin123' },
        { username: 'test', password: 'test123' },
        { username: 'demo', password: 'demo123' }
    ];

    for (const user of defaultUsers) {
        try {
            await pool.query(
                'INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING',
                [user.username, hashPassword(user.password)]
            );
        } catch (error) {
            console.error(`Ошибка создания пользователя ${user.username}:`, error);
        }
    }

    console.log('✅ Созданы тестовые пользователи:');
    console.log('   - admin / admin123');
    console.log('   - test / test123');
    console.log('   - demo / demo123');
}

// Хеширование пароля
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Генерация токена
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware для проверки авторизации
async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    try {
        const result = await pool.query(
            'SELECT s.*, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW()',
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Недействительная сессия' });
        }

        req.user = {
            id: result.rows[0].user_id,
            username: result.rows[0].username,
            createdAt: result.rows[0].created_at
        };
        next();
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
}

// Регистрация
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

        const passwordHash = hashPassword(password);
        
        // Создаем пользователя
        const userResult = await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
            [username, passwordHash]
        );

        const user = userResult.rows[0];

        // Создаем сессию
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 дней

        await pool.query(
            'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
            [token, user.id, expiresAt]
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.created_at
            },
            token
        });
    } catch (error) {
        if (error.code === '23505') { // Уникальное ограничение
            return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
        }
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Вход
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Имя пользователя и пароль обязательны' });
        }

        const passwordHash = hashPassword(password);
        
        // Проверяем пользователя
        const userResult = await pool.query(
            'SELECT * FROM users WHERE username = $1 AND password_hash = $2 AND is_active = true',
            [username, passwordHash]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
        }

        const user = userResult.rows[0];

        // Удаляем старые сессии
        await pool.query('DELETE FROM sessions WHERE user_id = $1', [user.id]);

        // Создаем новую сессию
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await pool.query(
            'INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
            [token, user.id, expiresAt]
        );

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.created_at
            },
            token
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Выход
app.post('/api/logout', requireAuth, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
        res.json({ success: true, message: 'Выход выполнен успешно' });
    } catch (error) {
        console.error('Ошибка выхода:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Информация о пользователе
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
        const result = await pool.query('SELECT * FROM events ORDER BY date, time_start');
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка получения событий:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Создание события
app.post('/api/events', requireAuth, async (req, res) => {
    try {
        const { title, description, date, timeStart, timeEnd, color, participants } = req.body;
        
        if (!title || !date) {
            return res.status(400).json({ error: 'Название и дата события обязательны' });
        }

        const result = await pool.query(
            `INSERT INTO events (title, description, date, time_start, time_end, color, participants, created_by, created_by_username) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [title, description, date, timeStart, timeEnd, color, participants || [], req.user.id, req.user.username]
        );

        res.json({ success: true, event: result.rows[0] });
    } catch (error) {
        console.error('Ошибка создания события:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Обновление события
app.put('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.id;
        const { title, description, date, timeStart, timeEnd, color, participants } = req.body;
        
        // Проверяем права
        const checkResult = await pool.query(
            'SELECT created_by FROM events WHERE id = $1',
            [eventId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Событие не найдено' });
        }

        if (checkResult.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ error: 'Нет прав для редактирования этого события' });
        }

        const result = await pool.query(
            `UPDATE events 
             SET title = $1, description = $2, date = $3, time_start = $4, time_end = $5, 
                 color = $6, participants = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 
             RETURNING *`,
            [title, description, date, timeStart, timeEnd, color, participants || [], eventId]
        );

        res.json({ success: true, event: result.rows[0] });
    } catch (error) {
        console.error('Ошибка обновления события:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Удаление события
app.delete('/api/events/:id', requireAuth, async (req, res) => {
    try {
        const eventId = req.params.id;
        
        // Проверяем права
        const checkResult = await pool.query(
            'SELECT created_by FROM events WHERE id = $1',
            [eventId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Событие не найдено' });
        }

        if (checkResult.rows[0].created_by !== req.user.id) {
            return res.status(403).json({ error: 'Нет прав для удаления этого события' });
        }

        await pool.query('DELETE FROM events WHERE id = $1', [eventId]);

        res.json({ success: true, message: 'Событие удалено' });
    } catch (error) {
        console.error('Ошибка удаления события:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Очистка просроченных сессий (каждый час)
setInterval(async () => {
    try {
        const result = await pool.query('DELETE FROM sessions WHERE expires_at < NOW()');
        if (result.rowCount > 0) {
            console.log(`Очищено ${result.rowCount} просроченных сессий`);
        }
    } catch (error) {
        console.error('Ошибка очистки сессий:', error);
    }
}, 60 * 60 * 1000);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Запуск сервера
async function startServer() {
    try {
        await initializeDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Сервер Codex запущен на порту ${PORT}`);
            console.log('📊 База данных: PostgreSQL');
            console.log('✅ Данные сохраняются постоянно!');
            console.log('\nДоступные эндпоинты:');
            console.log('  POST /api/register - Регистрация');
            console.log('  POST /api/login - Авторизация');
            console.log('  POST /api/logout - Выход');
            console.log('  GET  /api/user - Информация о пользователе');
            console.log('  GET  /api/events - Получение событий');
            console.log('  POST /api/events - Создание события');
            console.log('  PUT  /api/events/:id - Обновление события');
            console.log('  DELETE /api/events/:id - Удаление события');
        });
    } catch (error) {
        console.error('Ошибка запуска сервера:', error);
        process.exit(1);
    }
}

startServer();
