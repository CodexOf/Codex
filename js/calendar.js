// Календарь событий для Codex с системой пользователей
(function() {
    'use strict';
    
    // Проверяем авторизацию
    console.log('📅 Calendar.js: Проверка авторизации');
    console.log('🎫 Токен:', localStorage.getItem('authToken'));
    console.log('👤 Пользователь:', localStorage.getItem('currentUser'));
    console.log('🔐 authManager:', window.authManager);
    console.log('✅ isAuthenticated:', window.authManager?.isAuthenticated());
    
    if (!window.authManager || !window.authManager.isAuthenticated()) {
        console.warn('Пользователь не авторизован, перенаправляем на страницу входа');
        window.location.href = 'auth.html?returnTo=calendar';
        return;
    }
    
    // Данные календаря
    let currentDate = new Date();
    let events = [];
    let editingEventId = null;
    let selectedColor = '#3498db';
    let participants = [];

    // Элементы DOM
    const elements = {
        currentMonth: document.getElementById('currentMonth'),
        calendarDays: document.getElementById('calendarDays'),
        eventsList: document.getElementById('eventsList'),
        eventModal: document.getElementById('eventModal'),
        modalTitle: document.getElementById('modalTitle'),
        eventForm: document.getElementById('eventForm'),
        participantsList: document.getElementById('participantsList'),
        participantInput: document.getElementById('participantInput'),
        currentUser: document.getElementById('currentUser'),
        logoutBtn: document.getElementById('logoutBtn')
    };

    // Инициализация
    async function init() {
        try {
            // Проверяем токен
            const isValid = await window.authManager.verifyToken();
            if (!isValid) {
                window.location.href = 'auth.html?returnTo=calendar';
                return;
            }
            
            // Загружаем события с сервера
            await loadEventsFromServer();
            
            renderCalendar();
            renderEventsList();
            attachEventListeners();
            updateUserInfo();
            
            console.log('Календарь инициализирован успешно');
        } catch (error) {
            console.error('Ошибка инициализации календаря:', error);
            showError('Ошибка загрузки календаря: ' + error.message);
        }
    }

    // Загрузка событий с сервера
    async function loadEventsFromServer() {
        try {
            events = await window.eventManager.loadEvents();
            console.log('Загружено событий:', events.length);
        } catch (error) {
            console.error('Ошибка загрузки событий:', error);
            events = [];
            throw error;
        }
    }

    // Обновление информации о пользователе
    function updateUserInfo() {
        const user = window.authManager.getCurrentUser();
        if (elements.currentUser && user) {
            elements.currentUser.textContent = user.username;
        }
    }

    // Отрисовка календаря
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Обновляем заголовок
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                          'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        elements.currentMonth.textContent = `${monthNames[month]} ${year}`;
        
        // Очищаем сетку
        elements.calendarDays.innerHTML = '';
        
        // Первый день месяца
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevLastDay = new Date(year, month, 0);
        
        // День недели первого дня (0 = воскресенье)
        let firstDayOfWeek = firstDay.getDay();
        // Преобразуем в понедельник = 0
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        // Добавляем дни предыдущего месяца
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevLastDay.getDate() - i;
            createDayElement(new Date(year, month - 1, day), true);
        }
        
        // Добавляем дни текущего месяца
        for (let day = 1; day <= lastDay.getDate(); day++) {
            createDayElement(new Date(year, month, day), false);
        }
        
        // Добавляем дни следующего месяца
        const remainingDays = 42 - (firstDayOfWeek + lastDay.getDate());
        for (let day = 1; day <= remainingDays; day++) {
            createDayElement(new Date(year, month + 1, day), true);
        }
    }

    // Создание элемента дня
    function createDayElement(date, isOtherMonth) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayEl.classList.add('other-month');
        }
        
        // Проверяем, является ли день сегодняшним
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayEl.classList.add('today');
        }
        
        // Номер дня
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = date.getDate();
        dayEl.appendChild(dayNumber);
        
        // События дня
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
        
        if (dayEvents.length > 0) {
            dayEl.classList.add('has-events');
            
            // Показываем до 3 событий
            dayEvents.slice(0, 3).forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = 'calendar-event';
                eventEl.style.backgroundColor = event.color || '#3498db';
                eventEl.textContent = event.title;
                eventEl.title = `${event.title} (${event.createdByUsername})`;
                
                // Добавляем индикатор для собственных событий
                if (window.eventManager.canEditEvent(event)) {
                    eventEl.classList.add('own-event');
                }
                
                dayEl.appendChild(eventEl);
            });
            
            if (dayEvents.length > 3) {
                const moreEl = document.createElement('div');
                moreEl.className = 'calendar-event';
                moreEl.style.backgroundColor = '#666';
                moreEl.textContent = `+${dayEvents.length - 3} ещё`;
                dayEl.appendChild(moreEl);
            }
        }
        
        // Клик по дню
        dayEl.addEventListener('click', () => {
            if (!isOtherMonth) {
                openEventModal(date);
            }
        });
        
        elements.calendarDays.appendChild(dayEl);
    }

    // Отрисовка списка событий
    function renderEventsList() {
        const upcomingEvents = window.eventManager.getUpcomingEvents();
        
        if (upcomingEvents.length === 0) {
            elements.eventsList.innerHTML = '<p class="no-events">Нет запланированных событий</p>';
            return;
        }
        
        elements.eventsList.innerHTML = '';
        
        upcomingEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-item';
            
            // Добавляем класс для собственных событий
            if (window.eventManager.canEditEvent(event)) {
                eventEl.classList.add('own-event');
            }
            
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            let timeStr = '';
            if (event.timeStart) {
                timeStr = event.timeStart;
                if (event.timeEnd) {
                    timeStr += ` - ${event.timeEnd}`;
                }
            }
            
            eventEl.innerHTML = `
                <div class="event-info">
                    <div class="event-title" style="color: ${event.color || '#3498db'}">${event.title}</div>
                    <div class="event-datetime">${dateStr}${timeStr ? ', ' + timeStr : ''}</div>
                    <div class="event-creator">
                        <i class="fas fa-user"></i> ${event.createdByUsername}
                        ${event.createdAt ? ` • ${new Date(event.createdAt).toLocaleDateString('ru-RU')}` : ''}
                    </div>
                    ${event.participants && event.participants.length > 0 ? 
                        `<div class="event-participants">
                            <i class="fas fa-users"></i> ${event.participants.join(', ')}
                        </div>` : ''}
                </div>
                <div class="event-actions">
                    ${window.eventManager.canEditEvent(event) ? `
                        <button onclick="editEvent('${event.id}')" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteEvent('${event.id}')" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : `
                        <span class="read-only-indicator" title="Событие другого пользователя">
                            <i class="fas fa-eye"></i>
                        </span>
                    `}
                </div>
            `;
            
            elements.eventsList.appendChild(eventEl);
        });
    }

    // Открытие модального окна
    function openEventModal(date = null) {
        editingEventId = null;
        participants = [];
        selectedColor = '#3498db';
        
        elements.modalTitle.textContent = 'Новое событие';
        elements.eventForm.reset();
        
        if (date) {
            const dateStr = date.toISOString().split('T')[0];
            document.getElementById('eventDate').value = dateStr;
        }
        
        renderParticipants();
        updateColorPicker();
        elements.eventModal.style.display = 'flex';
    }

    // Закрытие модального окна
    function closeEventModal() {
        elements.eventModal.style.display = 'none';
        elements.eventForm.reset();
        participants = [];
        editingEventId = null;
    }

    // Добавление участника
    function addParticipant() {
        const name = elements.participantInput.value.trim();
        if (name && !participants.includes(name)) {
            participants.push(name);
            elements.participantInput.value = '';
            renderParticipants();
        }
    }

    // Удаление участника
    function removeParticipant(index) {
        participants.splice(index, 1);
        renderParticipants();
    }

    // Отрисовка списка участников
    function renderParticipants() {
        elements.participantsList.innerHTML = '';
        participants.forEach((participant, index) => {
            const tag = document.createElement('div');
            tag.className = 'participant-tag';
            tag.innerHTML = `
                ${participant}
                <span class="participant-remove" onclick="removeParticipant(${index})">
                    <i class="fas fa-times"></i>
                </span>
            `;
            elements.participantsList.appendChild(tag);
        });
    }

    // Обновление выбора цвета
    function updateColorPicker() {
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === selectedColor);
        });
    }

    // Сохранение события
    async function saveEvent(formData) {
        try {
            const eventData = {
                title: formData.get('title'),
                date: formData.get('date'),
                timeStart: formData.get('timeStart'),
                timeEnd: formData.get('timeEnd'),
                description: formData.get('description'),
                participants: [...participants],
                color: selectedColor
            };
            
            let result;
            if (editingEventId) {
                // Обновляем существующее событие
                result = await window.eventManager.updateEvent(editingEventId, eventData);
            } else {
                // Создаем новое событие
                result = await window.eventManager.createEvent(eventData);
            }
            
            if (result.success) {
                // Обновляем локальный массив событий
                events = window.eventManager.events;
                
                // Обновляем интерфейс
                renderCalendar();
                renderEventsList();
                closeEventModal();
                
                showSuccess(editingEventId ? 'Событие обновлено' : 'Событие создано');
            } else {
                showError(result.error || 'Ошибка сохранения события');
            }
        } catch (error) {
            console.error('Ошибка сохранения события:', error);
            showError('Ошибка подключения к серверу');
        }
    }

    // Редактирование события
    async function editEvent(eventId) {
        const event = events.find(e => e.id === eventId);
        if (!event) {
            showError('Событие не найдено');
            return;
        }
        
        // Проверяем права доступа
        if (!window.eventManager.canEditEvent(event)) {
            showError('У вас нет прав для редактирования этого события');
            return;
        }
        
        editingEventId = eventId;
        participants = [...(event.participants || [])];
        selectedColor = event.color || '#3498db';
        
        elements.modalTitle.textContent = 'Редактировать событие';
        
        // Заполняем форму
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTimeStart').value = event.timeStart || '';
        document.getElementById('eventTimeEnd').value = event.timeEnd || '';
        document.getElementById('eventDescription').value = event.description || '';
        
        renderParticipants();
        updateColorPicker();
        elements.eventModal.style.display = 'flex';
    }

    // Удаление события
    async function deleteEvent(eventId) {
        const event = events.find(e => e.id === eventId);
        if (!event) {
            showError('Событие не найдено');
            return;
        }
        
        // Проверяем права доступа
        if (!window.eventManager.canEditEvent(event)) {
            showError('У вас нет прав для удаления этого события');
            return;
        }
        
        if (!confirm('Вы уверены, что хотите удалить это событие?')) {
            return;
        }
        
        try {
            const result = await window.eventManager.deleteEvent(eventId);
            
            if (result.success) {
                // Обновляем локальный массив событий
                events = window.eventManager.events;
                
                renderCalendar();
                renderEventsList();
                showSuccess('Событие удалено');
            } else {
                showError(result.error || 'Ошибка удаления события');
            }
        } catch (error) {
            console.error('Ошибка удаления события:', error);
            showError('Ошибка подключения к серверу');
        }
    }

    // Отображение сообщений
    function showError(message) {
        // Создаем временное уведомление
        const errorEl = document.createElement('div');
        errorEl.className = 'notification error';
        errorEl.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(errorEl);
        
        setTimeout(() => {
            errorEl.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            errorEl.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(errorEl);
            }, 300);
        }, 4000);
    }

    function showSuccess(message) {
        const successEl = document.createElement('div');
        successEl.className = 'notification success';
        successEl.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(successEl);
        
        setTimeout(() => {
            successEl.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            successEl.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(successEl);
            }, 300);
        }, 3000);
    }

    // Привязка обработчиков событий
    function attachEventListeners() {
        // Навигация по месяцам
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        
        document.getElementById('nextMonth')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
        
        // Кнопка "Сегодня"
        document.getElementById('todayBtn')?.addEventListener('click', () => {
            currentDate = new Date();
            renderCalendar();
        });
        
        // Кнопка добавления события
        document.getElementById('addEventBtn')?.addEventListener('click', () => {
            openEventModal();
        });
        
        // Кнопка выхода
        elements.logoutBtn?.addEventListener('click', async () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                await window.authManager.logout();
            }
        });
        
        // Закрытие модального окна
        document.getElementById('closeModal')?.addEventListener('click', closeEventModal);
        document.getElementById('cancelBtn')?.addEventListener('click', closeEventModal);
        
        // Клик вне модального окна
        elements.eventModal?.addEventListener('click', (e) => {
            if (e.target === elements.eventModal) {
                closeEventModal();
            }
        });
        
        // Форма события
        elements.eventForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(elements.eventForm);
            saveEvent(formData);
        });
        
        // Добавление участника
        document.getElementById('addParticipant')?.addEventListener('click', addParticipant);
        
        // Enter в поле участника
        elements.participantInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addParticipant();
            }
        });
        
        // Выбор цвета
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedColor = btn.dataset.color;
                updateColorPicker();
            });
        });
        
        // Клавиатурные сокращения
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.eventModal.style.display === 'flex') {
                closeEventModal();
            }
        });
    }

    // Экспорт функций для глобального доступа
    window.CalendarModule = {
        editEvent: editEvent,
        deleteEvent: deleteEvent,
        removeParticipant: removeParticipant,
        refreshEvents: async () => {
            await loadEventsFromServer();
            renderCalendar();
            renderEventsList();
        }
    };

    // Инициализация при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
