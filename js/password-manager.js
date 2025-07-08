// Утилиты для работы с паролями в локальной системе
class PasswordManager {
    constructor(authManager) {
        this.auth = authManager;
    }

    // Генерация секретного вопроса при регистрации
    static getSecurityQuestions() {
        return [
            "В каком городе вы родились?",
            "Как звали вашего первого питомца?",
            "Какая ваша любимая книга?",
            "В какой школе вы учились?",
            "Как звали вашего лучшего друга детства?",
            "Какой ваш любимый фильм?",
            "Название улицы, на которой вы выросли?",
            "Девичья фамилия вашей матери?"
        ];
    }

    // Хеширование ответа на секретный вопрос
    hashSecurityAnswer(answer) {
        return this.auth.hashPassword(answer.toLowerCase().trim());
    }

    // Проверка пользователя по имени пользователя и секретному вопросу
    verifySecurityAnswer(username, answer) {
        try {
            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (!user || !user.securityAnswer) {
                return false;
            }
            
            const hashedAnswer = this.hashSecurityAnswer(answer);
            return user.securityAnswer === hashedAnswer;
        } catch (error) {
            console.error('Ошибка проверки секретного ответа:', error);
            return false;
        }
    }

    // Сброс пароля
    resetPassword(username, newPassword, securityAnswer) {
        try {
            if (!this.verifySecurityAnswer(username, securityAnswer)) {
                return { success: false, error: 'Неверный ответ на секретный вопрос' };
            }

            if (newPassword.length < 6) {
                return { success: false, error: 'Пароль должен содержать минимум 6 символов' };
            }

            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (userIndex === -1) {
                return { success: false, error: 'Пользователь не найден' };
            }

            // Обновляем пароль
            users[userIndex].password = this.auth.hashPassword(newPassword);
            users[userIndex].updatedAt = new Date().toISOString();
            
            localStorage.setItem('codex_users', JSON.stringify(users));
            
            return { success: true, message: 'Пароль успешно изменен' };
            
        } catch (error) {
            console.error('Ошибка сброса пароля:', error);
            return { success: false, error: 'Ошибка при сбросе пароля' };
        }
    }

    // Получение секретного вопроса пользователя
    getSecurityQuestion(username) {
        try {
            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
            
            if (user && user.securityQuestion) {
                return { success: true, question: user.securityQuestion };
            } else {
                return { success: false, error: 'Пользователь не найден или секретный вопрос не установлен' };
            }
        } catch (error) {
            console.error('Ошибка получения секретного вопроса:', error);
            return { success: false, error: 'Ошибка получения секретного вопроса' };
        }
    }

    // Админская функция - показать всех пользователей (только для отладки)
    static showAllUsers() {
        try {
            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            console.table(users.map(u => ({
                id: u.id,
                username: u.username,
                hasPassword: !!u.password,
                hasSecurityQuestion: !!u.securityQuestion,
                createdAt: u.createdAt
            })));
            return users;
        } catch (error) {
            console.error('Ошибка получения пользователей:', error);
            return [];
        }
    }

    // Админская функция - сброс пароля по ID пользователя
    static adminResetPassword(userId, newPassword) {
        try {
            const users = JSON.parse(localStorage.getItem('codex_users') || '[]');
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                return { success: false, error: 'Пользователь не найден' };
            }

            const authManager = window.localAuthManager || window.authManager;
            users[userIndex].password = authManager.hashPassword(newPassword);
            users[userIndex].updatedAt = new Date().toISOString();
            
            localStorage.setItem('codex_users', JSON.stringify(users));
            
            console.log(`Пароль пользователя ${users[userIndex].username} изменен на: ${newPassword}`);
            return { success: true, message: 'Пароль администратора изменен' };
            
        } catch (error) {
            console.error('Ошибка админского сброса пароля:', error);
            return { success: false, error: 'Ошибка при сбросе пароля' };
        }
    }
}

// Экспорт для глобального использования
window.PasswordManager = PasswordManager;

console.log('Менеджер паролей загружен');
