// Универсальный менеджер событий с офлайн поддержкой
class ImprovedEventManager {
    constructor(authManager) {
        this.auth = authManager;
        this.events = [];
        this.isLoaded = false;
        this.lastSync = 0;
    }

    async loadEvents() {
        try {
            // Сначала загружаем кешированные события
            const cachedEvents = PersistentStorage.getItem('cachedEvents');
            if (cachedEvents && Array.isArray(cachedEvents)) {
                this.events = cachedEvents;
                this.isLoaded = true;
                console.log('📦 Загружены кешированные события:', this.events.length);
            }

            // Пытаемся обновить с сервера
            if (this.auth.isAuthenticated()) {
                await this.syncEventsFromServer();
            }

            return this.events;
        } catch (error) {
            console.error('Ошибка загрузки событий:', error);
            
            // Возвращаем кешированные данные при ошибке
            return this.events;
        }
    }

    async syncEventsFromServer() {
        try {
            const response = await this.auth.makeAuthenticatedRequest('/api/events');
            const serverEvents = await response.json();
            
            if (Array.isArray(serverEvents)) {
                // Объединяем серверные и локальные события
                this.events = this.mergeEvents(serverEvents, this.getLocalEvents());
                
                // Кешируем обновленные события
                PersistentStorage.setItem('cachedEvents', this.events);
                this.lastSync = Date.now();
                PersistentStorage.setItem('eventsLastSync', this.lastSync);
                
                console.log('🔄 События синхронизированы с сервера:', this.events.length);
                return this.events;
            }
        } catch (error) {
            console.warn('⚠️ Не удалось синхронизировать с сервера:', error.message);
            throw error;
        }
    }

    mergeEvents(serverEvents, localEvents) {
        const merged = [...serverEvents];
        
        // Добавляем локальные события, которых нет на сервере
        for (const localEvent of localEvents) {
            const existsOnServer = serverEvents.find(se => se.id === localEvent.id);
            if (!existsOnServer && localEvent.id.startsWith('local_')) {
                merged.push(localEvent);
            }
        }

        // Сортируем по дате
        return merged.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getLocalEvents() {
        return PersistentStorage.getItem('localEvents') || [];
    }

    saveLocalEvents(events) {
        PersistentStorage.setItem('localEvents', events);
    }

    saveToCache() {
        PersistentStorage.setItem('cachedEvents', this.events);
    }

    async createEvent(eventData) {
        try {
            // Создаем событие с временным ID
            const tempEvent = {
                id: 'temp_' + Date.now(),
                ...eventData,
                createdBy: this.auth.user?.id || 'local',
                createdByUsername: this.auth.user?.username || 'Локальный пользователь',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isLocal: true
            };

            // Добавляем в локальный список
            this.events.push(tempEvent);
            this.saveToCache();

            // Пытаемся создать на сервере
            if (this.auth.isAuthenticated() && !this.auth.token.startsWith('offline_')) {
                try {
                    const response = await this.auth.makeAuthenticatedRequest('/api/events', {
                        method: 'POST',
                        body: JSON.stringify(eventData)
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        // Заменяем временное событие на серверное
                        const index = this.events.findIndex(e => e.id === tempEvent.id);
                        if (index !== -1) {
                            this.events[index] = data.event;
                            this.saveToCache();
                        }
                        
                        console.log('✅ Событие создано на сервере');
                        return { success: true, event: data.event };
                    }
                } catch (error) {
                    console.warn('⚠️ Не удалось создать на сервере, сохранено локально');
                    
                    // Помечаем для синхронизации
                    tempEvent.needsSync = true;
                    this.queueForSync('create', tempEvent);
                }
            } else {
                // Офлайн режим - создаем локальное событие
                tempEvent.id = 'local_' + Date.now();
                tempEvent.needsSync = true;
                this.queueForSync('create', tempEvent);
                console.log('📱 Событие создано в офлайн режиме');
            }

            return { success: true, event: tempEvent };

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
            if (!this.canEditEvent(event)) {
                return { success: false, error: 'Нет прав для редактирования этого события' };
            }

            // Обновляем локально
            const updatedEvent = {
                ...event,
                ...eventData,
                id: eventId, // Сохраняем оригинальный ID
                updatedAt: new Date().toISOString(),
                needsSync: true
            };

            this.events[eventIndex] = updatedEvent;
            this.saveToCache();

            // Пытаемся обновить на сервере
            if (this.auth.isAuthenticated() && !this.auth.token.startsWith('offline_') && !eventId.startsWith('local_')) {
                try {
                    const response = await this.auth.makeAuthenticatedRequest(`/api/events/${eventId}`, {
                        method: 'PUT',
                        body: JSON.stringify(eventData)
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        this.events[eventIndex] = data.event;
                        this.saveToCache();
                        console.log('✅ Событие обновлено на сервере');
                        return { success: true, event: data.event };
                    }
                } catch (error) {
                    console.warn('⚠️ Не удалось обновить на сервере, сохранено локально');
                    this.queueForSync('update', updatedEvent);
                }
            } else {
                // Офлайн режим или локальное событие
                this.queueForSync('update', updatedEvent);
                console.log('📱 Событие обновлено в офлайн режиме');
            }

            return { success: true, event: updatedEvent };

        } catch (error) {
            console.error('Ошибка обновления события:', error);
            return { success: false, error: 'Ошибка обновления события' };
        }
    }

    async deleteEvent(eventId) {
        try {
            const eventIndex = this.events.findIndex(e => e.id === eventId);
            if (eventIndex === -1) {
                return { success: false, error: 'Событие не найдено' };
            }

            const event = this.events[eventIndex];
            
            // Проверяем права доступа
            if (!this.canEditEvent(event)) {
                return { success: false, error: 'Нет прав для удаления этого события' };
            }

            // Удаляем локально
            this.events.splice(eventIndex, 1);
            this.saveToCache();

            // Пытаемся удалить на сервере
            if (this.auth.isAuthenticated() && !this.auth.token.startsWith('offline_') && !eventId.startsWith('local_')) {
                try {
                    const response = await this.auth.makeAuthenticatedRequest(`/api/events/${eventId}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        console.log('✅ Событие удалено на сервере');
                        return { success: true };
                    }
                } catch (error) {
                    console.warn('⚠️ Не удалось удалить на сервере');
                    this.queueForSync('delete', { id: eventId });
                }
            } else {
                // Офлайн режим или локальное событие
                if (!eventId.startsWith('local_')) {
                    this.queueForSync('delete', { id: eventId });
                }
                console.log('📱 Событие удалено в офлайн режиме');
            }

            return { success: true };

        } catch (error) {
            console.error('Ошибка удаления события:', error);
            return { success: false, error: 'Ошибка удаления события' };
        }
    }

    queueForSync(action, eventData) {
        const syncQueue = PersistentStorage.getItem('eventSyncQueue') || [];
        syncQueue.push({
            action,
            eventData,
            timestamp: Date.now(),
            id: Date.now().toString()
        });
        PersistentStorage.setItem('eventSyncQueue', syncQueue);
        console.log(`📝 Действие "${action}" добавлено в очередь синхронизации`);
    }

    async processSyncQueue() {
        const syncQueue = PersistentStorage.getItem('eventSyncQueue') || [];
        if (syncQueue.length === 0) return;

        console.log(`🔄 Обработка ${syncQueue.length} событий из очереди синхронизации...`);
        
        const processed = [];
        const failed = [];

        for (const item of syncQueue) {
            try {
                let success = false;

                switch (item.action) {
                    case 'create':
                        const createResult = await this.syncCreateEvent(item.eventData);
                        success = createResult.success;
                        if (success) {
                            // Обновляем локальное событие серверными данными
                            this.updateLocalEventWithServerData(item.eventData.id, createResult.event);
                        }
                        break;

                    case 'update':
                        const updateResult = await this.syncUpdateEvent(item.eventData);
                        success = updateResult.success;
                        break;

                    case 'delete':
                        const deleteResult = await this.syncDeleteEvent(item.eventData.id);
                        success = deleteResult.success;
                        break;
                }

                if (success) {
                    processed.push(item.id);
                    console.log(`✅ Синхронизировано: ${item.action} для события ${item.eventData.id || item.eventData.title}`);
                } else {
                    failed.push(item);
                }

            } catch (error) {
                failed.push(item);
                console.warn(`❌ Ошибка синхронизации: ${error.message}`);
            }
        }

        // Обновляем очередь, оставляя только неудачные попытки
        PersistentStorage.setItem('eventSyncQueue', failed);
        
        if (processed.length > 0) {
            console.log(`✅ Синхронизировано ${processed.length} событий`);
        }
        
        if (failed.length > 0) {
            console.warn(`⚠️ Не удалось синхронизировать ${failed.length} событий`);
        }

        // Обновляем кеш после синхронизации
        if (processed.length > 0) {
            this.saveToCache();
        }
    }

    async syncCreateEvent(eventData) {
        try {
            const response = await this.auth.makeAuthenticatedRequest('/api/events', {
                method: 'POST',
                body: JSON.stringify(eventData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async syncUpdateEvent(eventData) {
        try {
            const response = await this.auth.makeAuthenticatedRequest(`/api/events/${eventData.id}`, {
                method: 'PUT',
                body: JSON.stringify(eventData)
            });

            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async syncDeleteEvent(eventId) {
        try {
            const response = await this.auth.makeAuthenticatedRequest(`/api/events/${eventId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            return data;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    updateLocalEventWithServerData(localId, serverEvent) {
        const index = this.events.findIndex(e => e.id === localId);
        if (index !== -1) {
            this.events[index] = { ...serverEvent, needsSync: false };
        }
    }

    canEditEvent(event) {
        if (!this.auth.user) return false;
        
        // Владелец события может редактировать
        if (event.createdBy === this.auth.user.id) return true;
        
        // Локальные события может редактировать любой авторизованный пользователь
        if (event.id && (event.id.startsWith('local_') || event.id.startsWith('temp_'))) return true;
        
        return false;
    }

    // Методы фильтрации и поиска
    getEventsByUser(userId = null) {
        const targetUserId = userId || this.auth.user?.id;
        return this.events.filter(event => event.createdBy === targetUserId);
    }

    getUpcomingEvents(days = 30) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
        
        return this.events
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= now && eventDate <= futureDate;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    getEventsByDate(date) {
        const targetDate = new Date(date).toDateString();
        return this.events.filter(event => new Date(event.date).toDateString() === targetDate);
    }

    getEventsByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= start && eventDate <= end;
        });
    }

    searchEvents(query) {
        const searchTerm = query.toLowerCase();
        return this.events.filter(event => 
            event.title.toLowerCase().includes(searchTerm) ||
            event.description?.toLowerCase().includes(searchTerm) ||
            event.createdByUsername.toLowerCase().includes(searchTerm)
        );
    }

    getEventsNeedingSync() {
        return this.events.filter(event => event.needsSync);
    }

    // Статистика и диагностика
    getEventStats() {
        const stats = {
            total: this.events.length,
            byUser: {},
            upcoming: this.getUpcomingEvents().length,
            needingSync: this.getEventsNeedingSync().length,
            local: this.events.filter(e => e.id?.startsWith('local_')).length,
            server: this.events.filter(e => !e.id?.startsWith('local_') && !e.id?.startsWith('temp_')).length
        };

        // Подсчет по пользователям
        this.events.forEach(event => {
            const user = event.createdByUsername || 'Неизвестно';
            stats.byUser[user] = (stats.byUser[user] || 0) + 1;
        });

        return stats;
    }

    async exportEvents() {
        const exportData = {
            events: this.events,
            exportedAt: new Date().toISOString(),
            exportedBy: this.auth.user?.username || 'Неизвестно',
            stats: this.getEventStats()
        };

        return JSON.stringify(exportData, null, 2);
    }

    async importEvents(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (!importData.events || !Array.isArray(importData.events)) {
                throw new Error('Неверный формат данных');
            }

            let imported = 0;
            let skipped = 0;

            for (const event of importData.events) {
                // Проверяем, существует ли событие
                const exists = this.events.find(e => e.id === event.id || 
                    (e.title === event.title && e.date === event.date));
                
                if (!exists) {
                    // Создаем как локальное событие
                    const localEvent = {
                        ...event,
                        id: 'local_' + Date.now() + '_' + imported,
                        importedAt: new Date().toISOString(),
                        needsSync: true
                    };
                    
                    this.events.push(localEvent);
                    imported++;
                } else {
                    skipped++;
                }
            }

            this.saveToCache();
            
            return {
                success: true,
                imported,
                skipped,
                total: importData.events.length
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Автоматическая очистка старых событий
    cleanupOldEvents(daysToKeep = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const initialCount = this.events.length;
        this.events = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= cutoffDate;
        });

        const removedCount = initialCount - this.events.length;
        
        if (removedCount > 0) {
            this.saveToCache();
            console.log(`🧹 Удалено ${removedCount} старых событий (старше ${daysToKeep} дней)`);
        }

        return removedCount;
    }

    // Резервное копирование
    async createBackup() {
        const backup = {
            events: this.events,
            syncQueue: PersistentStorage.getItem('eventSyncQueue') || [],
            lastSync: this.lastSync,
            createdAt: new Date().toISOString(),
            version: '1.0'
        };

        PersistentStorage.setItem('eventsBackup', backup);
        console.log('💾 Резервная копия событий создана');
        
        return backup;
    }

    async restoreFromBackup(backupData = null) {
        try {
            const backup = backupData || PersistentStorage.getItem('eventsBackup');
            
            if (!backup) {
                throw new Error('Резервная копия не найдена');
            }

            if (backup.events && Array.isArray(backup.events)) {
                this.events = backup.events;
                this.saveToCache();
                
                if (backup.syncQueue) {
                    PersistentStorage.setItem('eventSyncQueue', backup.syncQueue);
                }
                
                console.log('🔄 События восстановлены из резервной копии');
                return { success: true, eventsCount: this.events.length };
            } else {
                throw new Error('Неверный формат резервной копии');
            }

        } catch (error) {
            console.error('Ошибка восстановления из резервной копии:', error);
            return { success: false, error: error.message };
        }
    }
}

// Экспорт для глобального использования
window.ImprovedEventManager = ImprovedEventManager;

console.log('✅ Улучшенный менеджер событий загружен');
