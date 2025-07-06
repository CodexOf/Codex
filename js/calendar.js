// Календарь событий для Codex
(function() {
    'use strict';
    
    // Данные календаря
    let currentDate = new Date();
    let events = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
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
        participantInput: document.getElementById('participantInput')
    };

    // Инициализация
    function init() {
        renderCalendar();
        renderEventsList();
        attachEventListeners();
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
                eventEl.title = event.title;
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
        const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
        const upcomingEvents = sortedEvents.filter(event => new Date(event.date) >= new Date());
        
        if (upcomingEvents.length === 0) {
            elements.eventsList.innerHTML = '<p class="no-events">Нет запланированных событий</p>';
            return;
        }
        
        elements.eventsList.innerHTML = '';
        
        upcomingEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-item';
            
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
                    ${event.participants && event.participants.length > 0 ? 
                        `<div class="event-participants">
                            <i class="fas fa-users"></i> ${event.participants.join(', ')}
                        </div>` : ''}
                </div>
                <div class="event-actions">
                    <button onclick="CalendarModule.editEvent('${event.id}')" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="CalendarModule.deleteEvent('${event.id}')" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
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
                <span class="participant-remove" onclick="CalendarModule.removeParticipant(${index})">
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
    function saveEvent(formData) {
        const eventData = {
            id: editingEventId || Date.now().toString(),
            title: formData.get('title'),
            date: formData.get('date'),
            timeStart: formData.get('timeStart'),
            timeEnd: formData.get('timeEnd'),
            description: formData.get('description'),
            participants: [...participants],
            color: selectedColor
        };
        
        if (editingEventId) {
            // Обновляем существующее событие
            const index = events.findIndex(e => e.id === editingEventId);
            if (index !== -1) {
                events[index] = eventData;
            }
        } else {
            // Добавляем новое событие
            events.push(eventData);
        }
        
        // Сохраняем в localStorage
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        // Обновляем интерфейс
        renderCalendar();
        renderEventsList();
        closeEventModal();
    }

    // Редактирование события
    function editEvent(eventId) {
        const event = events.find(e => e.id === eventId);
        if (!event) return;
        
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
    function deleteEvent(eventId) {
        if (confirm('Вы уверены, что хотите удалить это событие?')) {
            events = events.filter(e => e.id !== eventId);
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            renderCalendar();
            renderEventsList();
        }
    }

    // Привязка обработчиков событий
    function attachEventListeners() {
        // Навигация по месяцам
        document.getElementById('prevMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
        
        // Кнопка "Сегодня"
        document.getElementById('todayBtn').addEventListener('click', () => {
            currentDate = new Date();
            renderCalendar();
        });
        
        // Кнопка добавления события
        document.getElementById('addEventBtn').addEventListener('click', () => {
            openEventModal();
        });
        
        // Закрытие модального окна
        document.getElementById('closeModal').addEventListener('click', closeEventModal);
        document.getElementById('cancelBtn').addEventListener('click', closeEventModal);
        
        // Клик вне модального окна
        elements.eventModal.addEventListener('click', (e) => {
            if (e.target === elements.eventModal) {
                closeEventModal();
            }
        });
        
        // Форма события
        elements.eventForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(elements.eventForm);
            saveEvent(formData);
        });
        
        // Добавление участника
        document.getElementById('addParticipant').addEventListener('click', addParticipant);
        
        // Enter в поле участника
        elements.participantInput.addEventListener('keypress', (e) => {
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
        removeParticipant: removeParticipant
    };

    // Инициализация при загрузке
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
