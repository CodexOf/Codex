// Надежная система хранения данных с множественным резервированием
class PersistentStorage {
    static debug = false; // Включить для отладки

    static setItem(key, value) {
        const data = JSON.stringify(value);
        const results = {};

        // 1. Основное хранилище - localStorage
        try {
            localStorage.setItem(key, data);
            results.localStorage = true;
            this.log(`✅ Сохранено в localStorage: ${key}`);
        } catch (e) {
            results.localStorage = false;
            this.log(`❌ Ошибка localStorage: ${e.message}`);
        }

        // 2. Резервное хранилище - sessionStorage
        try {
            sessionStorage.setItem(key, data);
            results.sessionStorage = true;
            this.log(`✅ Сохранено в sessionStorage: ${key}`);
        } catch (e) {
            results.sessionStorage = false;
            this.log(`❌ Ошибка sessionStorage: ${e.message}`);
        }

        // 3. Критически важные данные в cookies
        if (['authToken', 'currentUser', 'userSettings'].includes(key)) {
            try {
                this.setCookie(key, data, 30); // 30 дней
                results.cookies = true;
                this.log(`✅ Сохранено в cookies: ${key}`);
            } catch (e) {
                results.cookies = false;
                this.log(`❌ Ошибка cookies: ${e.message}`);
            }
        }

        // 4. Расширенное хранилище - IndexedDB
        this.setToIndexedDB(key, value).then(() => {
            this.log(`✅ Сохранено в IndexedDB: ${key}`);
        }).catch(e => {
            this.log(`❌ Ошибка IndexedDB: ${e.message}`);
        });

        return results;
    }

    static getItem(key) {
        // Пробуем все источники по порядку приоритета
        const sources = [
            () => this.getFromLocalStorage(key),
            () => this.getFromSessionStorage(key),
            () => this.getFromCookies(key),
            () => this.getFromIndexedDB(key)
        ];

        for (const source of sources) {
            try {
                const result = source();
                if (result !== null && result !== undefined) {
                    this.log(`✅ Найдено в ${source.name || 'источнике'}: ${key}`);
                    
                    // Если нашли в резервном источнике, восстанавливаем в основном
                    if (source !== sources[0]) {
                        this.restoreToMainStorage(key, result);
                    }
                    
                    return result;
                }
            } catch (e) {
                this.log(`❌ Ошибка получения из источника: ${e.message}`);
            }
        }

        this.log(`⚠️ Данные не найдены: ${key}`);
        return null;
    }

    static getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    static getFromSessionStorage(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    static getFromCookies(key) {
        try {
            const data = this.getCookie(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    static async getFromIndexedDB(key) {
        try {
            return await this.getFromIndexedDBAsync(key);
        } catch (e) {
            return null;
        }
    }

    static restoreToMainStorage(key, value) {
        try {
            this.setItem(key, value);
            this.log(`🔄 Восстановлено в основном хранилище: ${key}`);
        } catch (e) {
            this.log(`❌ Ошибка восстановления: ${e.message}`);
        }
    }

    static removeItem(key) {
        // Удаляем из всех источников
        try { localStorage.removeItem(key); } catch (e) {}
        try { sessionStorage.removeItem(key); } catch (e) {}
        try { this.deleteCookie(key); } catch (e) {}
        this.removeFromIndexedDB(key);
        
        this.log(`🗑️ Удалено: ${key}`);
    }

    static clear() {
        // Очищаем все хранилища
        try { localStorage.clear(); } catch (e) {}
        try { sessionStorage.clear(); } catch (e) {}
        try { this.clearCookies(); } catch (e) {}
        this.clearIndexedDB();
        
        this.log(`🧹 Все данные очищены`);
    }

    // Работа с cookies
    static setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict; Secure`;
    }

    static getCookie(name) {
        return document.cookie.split('; ').reduce((r, v) => {
            const parts = v.split('=');
            return parts[0] === name ? decodeURIComponent(parts[1]) : r;
        }, '');
    }

    static deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    static clearCookies() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const eqPos = cookie.indexOf('=');
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            this.deleteCookie(name.trim());
        }
    }

    // Работа с IndexedDB
    static async setToIndexedDB(key, value) {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('CodexStorage', 1);
                
                request.onupgradeneeded = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains('data')) {
                        db.createObjectStore('data');
                    }
                };
                
                request.onsuccess = () => {
                    const db = request.result;
                    const transaction = db.transaction(['data'], 'readwrite');
                    const store = transaction.objectStore('data');
                    const putRequest = store.put(value, key);
                    
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                };
                
                request.onerror = () => reject(request.error);
                
            } catch (e) {
                reject(e);
            }
        });
    }

    static async getFromIndexedDBAsync(key) {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('CodexStorage', 1);
                
                request.onsuccess = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains('data')) {
                        resolve(null);
                        return;
                    }
                    
                    const transaction = db.transaction(['data'], 'readonly');
                    const store = transaction.objectStore('data');
                    const getRequest = store.get(key);
                    
                    getRequest.onsuccess = () => resolve(getRequest.result || null);
                    getRequest.onerror = () => reject(getRequest.error);
                };
                
                request.onerror = () => reject(request.error);
                
            } catch (e) {
                reject(e);
            }
        });
    }

    static async removeFromIndexedDB(key) {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('CodexStorage', 1);
                
                request.onsuccess = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains('data')) {
                        resolve();
                        return;
                    }
                    
                    const transaction = db.transaction(['data'], 'readwrite');
                    const store = transaction.objectStore('data');
                    const deleteRequest = store.delete(key);
                    
                    deleteRequest.onsuccess = () => resolve();
                    deleteRequest.onerror = () => reject(deleteRequest.error);
                };
                
                request.onerror = () => reject(request.error);
                
            } catch (e) {
                reject(e);
            }
        });
    }

    static async clearIndexedDB() {
        return new Promise((resolve, reject) => {
            try {
                const request = indexedDB.open('CodexStorage', 1);
                
                request.onsuccess = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains('data')) {
                        resolve();
                        return;
                    }
                    
                    const transaction = db.transaction(['data'], 'readwrite');
                    const store = transaction.objectStore('data');
                    const clearRequest = store.clear();
                    
                    clearRequest.onsuccess = () => resolve();
                    clearRequest.onerror = () => reject(clearRequest.error);
                };
                
                request.onerror = () => reject(request.error);
                
            } catch (e) {
                reject(e);
            }
        });
    }

    // Диагностика и статистика
    static async getStorageInfo() {
        const info = {
            localStorage: { available: false, items: 0, size: 0 },
            sessionStorage: { available: false, items: 0, size: 0 },
            cookies: { available: false, items: 0, size: 0 },
            indexedDB: { available: false, items: 0, size: 0 }
        };

        // localStorage
        try {
            info.localStorage.available = true;
            info.localStorage.items = localStorage.length;
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                info.localStorage.size += key.length + (value?.length || 0);
            }
        } catch (e) {}

        // sessionStorage
        try {
            info.sessionStorage.available = true;
            info.sessionStorage.items = sessionStorage.length;
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                const value = sessionStorage.getItem(key);
                info.sessionStorage.size += key.length + (value?.length || 0);
            }
        } catch (e) {}

        // cookies
        try {
            info.cookies.available = true;
            const cookies = document.cookie.split(';');
            info.cookies.items = cookies.length;
            info.cookies.size = document.cookie.length;
        } catch (e) {}

        // IndexedDB
        try {
            info.indexedDB.available = true;
            // Подсчет элементов в IndexedDB
            try {
                const db = await this.openIndexedDB();
                if (db.objectStoreNames.contains('data')) {
                    const transaction = db.transaction(['data'], 'readonly');
                    const store = transaction.objectStore('data');
                    const countRequest = store.count();
                    info.indexedDB.items = await new Promise(resolve => {
                        countRequest.onsuccess = () => resolve(countRequest.result);
                        countRequest.onerror = () => resolve(0);
                    });
                }
            } catch (e) {}
        } catch (e) {}

        return info;
    }

    static async openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('CodexStorage', 1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Утилиты
    static log(message) {
        if (this.debug) {
            console.log(`[PersistentStorage] ${message}`);
        }
    }

    static enableDebug() {
        this.debug = true;
        console.log('🔍 Отладка PersistentStorage включена');
    }

    static disableDebug() {
        this.debug = false;
    }

    // Тест всех систем хранения
    static async testAllSystems() {
        const testKey = 'test_' + Date.now();
        const testValue = { test: true, timestamp: Date.now() };
        
        console.log('🧪 Тестирование всех систем хранения...');
        
        // Тест записи
        const writeResults = this.setItem(testKey, testValue);
        console.log('📝 Результаты записи:', writeResults);
        
        // Тест чтения
        await new Promise(resolve => setTimeout(resolve, 100)); // Небольшая пауза для IndexedDB
        const readValue = this.getItem(testKey);
        console.log('📖 Результат чтения:', readValue);
        
        // Очистка
        this.removeItem(testKey);
        
        // Общая статистика
        const info = await this.getStorageInfo();
        console.log('📊 Информация о хранилищах:', info);
        
        return {
            writeResults,
            readSuccess: JSON.stringify(readValue) === JSON.stringify(testValue),
            storageInfo: info
        };
    }
}

// Экспорт для глобального использования
window.PersistentStorage = PersistentStorage;

console.log('✅ Система надежного хранения загружена');
console.log('💡 Используйте PersistentStorage.testAllSystems() для проверки работоспособности');
