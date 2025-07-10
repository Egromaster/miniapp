// Инициализация Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Состояние приложения
let state = {
  procedures: [],
  currentDate: new Date(),
  selectedDate: new Date(),
  editingProcedure: null
};

// Загрузка данных из localStorage
function loadData() {
  const saved = localStorage.getItem('skincareCalendar');
  if (saved) {
    const data = JSON.parse(saved);
    state.procedures = data.procedures || [];
    state.currentDate = new Date(data.currentDate || Date.now());
    state.selectedDate = new Date(data.selectedDate || Date.now());
  }
}

// Сохранение данных в localStorage
function saveData() {
  localStorage.setItem('skincareCalendar', JSON.stringify({
    procedures: state.procedures,
    currentDate: state.currentDate.toISOString(),
    selectedDate: state.selectedDate.toISOString()
  }));
}

// Форматирование даты
function formatDate(date) {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('ru-RU', options);
}

// Форматирование времени
function formatTime(time) {
  if (!time) return '';
  return time;
}

// Получение иконки для типа процедуры
function getProcedureIcon(type) {
  const icons = {
    cleansing: '🧼',
    toning: '💧',
    moisturizing: '💦',
    exfoliation: '✨',
    mask: '🎭',
    serum: '💎',
    sunscreen: '☀️',
    night: '🌙'
  };
  return icons[type] || '🧴';
}

// Получение названия типа процедуры
function getProcedureTypeName(type) {
  const names = {
    cleansing: 'Очищение',
    toning: 'Тонизирование',
    moisturizing: 'Увлажнение',
    exfoliation: 'Пилинг',
    mask: 'Маска',
    serum: 'Сыворотка',
    sunscreen: 'Солнцезащита',
    night: 'Ночной уход'
  };
  return names[type] || type;
}

// Проверка, должна ли процедура выполняться в определенную дату
function shouldPerformProcedure(procedure, date) {
  const procedureDate = new Date(procedure.startDate);
  const daysDiff = Math.floor((date - procedureDate) / (1000 * 60 * 60 * 24));
  
  switch (procedure.frequency) {
    case 'daily':
      return daysDiff >= 0;
    case 'twice_daily':
      return daysDiff >= 0;
    case 'weekly':
      return daysDiff >= 0 && daysDiff % 7 === 0;
    case 'biweekly':
      return daysDiff >= 0 && daysDiff % 14 === 0;
    case 'monthly':
      return daysDiff >= 0 && daysDiff % 30 === 0;
    default:
      return false;
  }
}

// Получение процедур для определенной даты
function getProceduresForDate(date) {
  return state.procedures.filter(procedure => shouldPerformProcedure(procedure, date));
}

// Обновление отображения текущего дня
function updateTodaySection() {
  const todayDateEl = document.getElementById('todayDate');
  const todayTasksEl = document.getElementById('todayTasks');
  
  todayDateEl.textContent = formatDate(state.currentDate);
  
  const todayProcedures = getProceduresForDate(state.currentDate);
  
  if (todayProcedures.length === 0) {
    todayTasksEl.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">Нет запланированных процедур на сегодня</p>';
    return;
  }
  
  todayTasksEl.innerHTML = todayProcedures.map(procedure => {
    const isCompleted = procedure.completedDates && 
      procedure.completedDates.includes(state.currentDate.toDateString());
    
    return `
      <div class="task-item ${isCompleted ? 'completed' : ''}" data-id="${procedure.id}">
        <div class="task-info">
          <div class="task-icon ${procedure.type}">${getProcedureIcon(procedure.type)}</div>
          <div class="task-details">
            <h4>${procedure.name}</h4>
            <p>${getProcedureTypeName(procedure.type)} • ${formatTime(procedure.time)}</p>
          </div>
        </div>
        <div class="task-actions">
          ${!isCompleted ? 
            `<button class="btn-small btn-complete" onclick="completeProcedure('${procedure.id}')">✓</button>` : 
            `<button class="btn-small btn-complete" style="background: #27ae60;" disabled>✓</button>`
          }
          <button class="btn-small btn-edit" onclick="editProcedure('${procedure.id}')">✏️</button>
        </div>
      </div>
    `;
  }).join('');
}

// Создание календаря
function createCalendar() {
  const currentMonthEl = document.getElementById('currentMonth');
  const calendarGridEl = document.getElementById('calendarGrid');
  
  const year = state.selectedDate.getFullYear();
  const month = state.selectedDate.getMonth();
  
  currentMonthEl.textContent = new Date(year, month).toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  });
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  let calendarHTML = '';
  
  // Дни недели
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  weekDays.forEach(day => {
    calendarHTML += `<div class="calendar-day" style="font-weight: bold; color: #7f8c8d;">${day}</div>`;
  });
  
  // Дни месяца
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const isCurrentMonth = currentDate.getMonth() === month;
    const isToday = currentDate.toDateString() === state.currentDate.toDateString();
    const hasProcedures = getProceduresForDate(currentDate).length > 0;
    
    let className = 'calendar-day';
    if (!isCurrentMonth) className += ' other-month';
    if (isToday) className += ' today';
    if (hasProcedures) className += ' has-procedures';
    
    calendarHTML += `
      <div class="${className}" onclick="selectDate('${currentDate.toISOString()}')">
        ${currentDate.getDate()}
      </div>
    `;
  }
  
  calendarGridEl.innerHTML = calendarHTML;
}

// Выбор даты в календаре
function selectDate(dateString) {
  state.selectedDate = new Date(dateString);
  updateTodaySection();
  saveData();
}

// Добавление новой процедуры
function addProcedure() {
  const name = document.getElementById('procedureName').value.trim();
  const type = document.getElementById('procedureType').value;
  const frequency = document.getElementById('frequency').value;
  const time = document.getElementById('procedureTime').value;
  
  if (!name || !type || !frequency) {
    alert('Пожалуйста, заполните все обязательные поля');
    return;
  }
  
  const newProcedure = {
    id: Date.now().toString(),
    name,
    type,
    frequency,
    time,
    startDate: state.currentDate.toISOString(),
    completedDates: []
  };
  
  state.procedures.push(newProcedure);
  saveData();
  updateTodaySection();
  createCalendar();
  updateStats();
  
  // Очистка формы
  document.getElementById('procedureName').value = '';
  document.getElementById('procedureType').value = '';
  document.getElementById('frequency').value = '';
  document.getElementById('procedureTime').value = '';
  
  // Уведомление пользователя
  tg.showAlert('Процедура добавлена!');
}

// Завершение процедуры
function completeProcedure(procedureId) {
  const procedure = state.procedures.find(p => p.id === procedureId);
  if (!procedure) return;
  
  if (!procedure.completedDates) {
    procedure.completedDates = [];
  }
  
  const todayString = state.currentDate.toDateString();
  if (!procedure.completedDates.includes(todayString)) {
    procedure.completedDates.push(todayString);
    saveData();
    updateTodaySection();
    updateStats();
    tg.showAlert('Процедура выполнена! 🎉');
  }
}

// Редактирование процедуры
function editProcedure(procedureId) {
  const procedure = state.procedures.find(p => p.id === procedureId);
  if (!procedure) return;
  
  state.editingProcedure = procedure;
  
  document.getElementById('editProcedureName').value = procedure.name;
  document.getElementById('editProcedureType').value = procedure.type;
  document.getElementById('editFrequency').value = procedure.frequency;
  document.getElementById('editProcedureTime').value = procedure.time || '';
  
  document.getElementById('editModal').style.display = 'block';
}

// Сохранение изменений процедуры
function saveProcedure() {
  if (!state.editingProcedure) return;
  
  const name = document.getElementById('editProcedureName').value.trim();
  const type = document.getElementById('editProcedureType').value;
  const frequency = document.getElementById('editFrequency').value;
  const time = document.getElementById('editProcedureTime').value;
  
  if (!name || !type || !frequency) {
    alert('Пожалуйста, заполните все обязательные поля');
    return;
  }
  
  state.editingProcedure.name = name;
  state.editingProcedure.type = type;
  state.editingProcedure.frequency = frequency;
  state.editingProcedure.time = time;
  
  saveData();
  updateTodaySection();
  createCalendar();
  updateStats();
  
  closeModal();
  tg.showAlert('Процедура обновлена!');
}

// Удаление процедуры
function deleteProcedure() {
  if (!state.editingProcedure) return;
  
  if (confirm('Вы уверены, что хотите удалить эту процедуру?')) {
    state.procedures = state.procedures.filter(p => p.id !== state.editingProcedure.id);
    saveData();
    updateTodaySection();
    createCalendar();
    updateStats();
    
    closeModal();
    tg.showAlert('Процедура удалена');
  }
}

// Закрытие модального окна
function closeModal() {
  document.getElementById('editModal').style.display = 'none';
  state.editingProcedure = null;
}

// Обновление статистики
function updateStats() {
  const todayProcedures = getProceduresForDate(state.currentDate);
  const completedToday = todayProcedures.filter(p => 
    p.completedDates && p.completedDates.includes(state.currentDate.toDateString())
  ).length;
  
  // Подсчет дней подряд
  let streakDays = 0;
  const today = new Date(state.currentDate);
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    const dayProcedures = getProceduresForDate(checkDate);
    const completedProcedures = dayProcedures.filter(p => 
      p.completedDates && p.completedDates.includes(checkDate.toDateString())
    );
    
    if (dayProcedures.length > 0 && completedProcedures.length === dayProcedures.length) {
      streakDays++;
    } else {
      break;
    }
  }
  
  // Общее количество процедур
  const totalProcedures = state.procedures.length;
  
  document.getElementById('completedToday').textContent = completedToday;
  document.getElementById('streakDays').textContent = streakDays;
  document.getElementById('totalProcedures').textContent = totalProcedures;
}

// Навигация по месяцам
function changeMonth(direction) {
  state.selectedDate.setMonth(state.selectedDate.getMonth() + direction);
  createCalendar();
  saveData();
}

// === Telegram Mini App: Мультиэкранная логика ===

let userEmail = null;
let userData = {};

function showScreen(id) {
  document.querySelectorAll('.app-screen').forEach(div => {
    div.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

// Показать welcome при старте
showScreen('screen-welcome');

// Welcome: переходы
const btnRegister = document.getElementById('btn-register');
const btnLogin = document.getElementById('btn-login');
if (btnRegister) btnRegister.onclick = () => showScreen('screen-register');
if (btnLogin) btnLogin.onclick = () => showScreen('screen-login');

// Регистрация
const btnDoRegister = document.getElementById('btn-do-register');
if (btnDoRegister) btnDoRegister.onclick = async () => {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  if (!name || !email || !password) {
    alert('Заполните все поля!');
    return;
  }
  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (data.status === 'ok') {
    userEmail = email;
    userData = { email };
    showScreen('screen-selfie');
  } else {
    alert(data.message || 'Ошибка регистрации');
  }
};

// Вход
const btnDoLogin = document.getElementById('btn-do-login');
if (btnDoLogin) btnDoLogin.onclick = async () => {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  if (!email || !password) {
    alert('Заполните все поля!');
    return;
  }
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (data.status === 'ok') {
    userEmail = email;
    userData = { email };
    showScreen('screen-selfie');
  } else {
    alert(data.message || 'Ошибка входа');
  }
};

// Селфи (пока только переход)
const btnTakeSelfie = document.getElementById('btn-take-selfie');
const btnSkipSelfie = document.getElementById('btn-skip-selfie');
if (btnTakeSelfie) btnTakeSelfie.onclick = () => showScreen('screen-gender');
if (btnSkipSelfie) btnSkipSelfie.onclick = () => showScreen('screen-gender');

// Пол
Array.from(document.getElementsByClassName('gender-btn')).forEach(btn => {
  btn.onclick = async () => {
    userData.gender = btn.dataset.gender;
    await fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, gender: userData.gender })
    });
    showScreen('screen-age');
  };
});

// Возраст
Array.from(document.getElementsByClassName('age-btn')).forEach(btn => {
  btn.onclick = async () => {
    userData.age = btn.dataset.age;
    await fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, age: userData.age })
    });
    showScreen('screen-skin');
  };
});

// Тип кожи
Array.from(document.getElementsByClassName('skin-btn')).forEach(btn => {
  btn.onclick = async () => {
    userData.skin_type = btn.dataset.skin;
    await fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, skin_type: userData.skin_type })
    });
    showScreen('screen-problems');
  };
});

// Проблемы кожи (мультивыбор)
let selectedProblems = [];
Array.from(document.getElementsByClassName('problem-btn')).forEach(btn => {
  btn.onclick = () => {
    const val = btn.dataset.problem;
    if (selectedProblems.includes(val)) {
      selectedProblems = selectedProblems.filter(p => p !== val);
      btn.classList.remove('selected');
    } else {
      selectedProblems.push(val);
      btn.classList.add('selected');
    }
  };
});
const btnProblemsNext = document.getElementById('btn-problems-next');
if (btnProblemsNext) btnProblemsNext.onclick = async () => {
  userData.problems = selectedProblems.join(', ');
  await fetch('/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, problems: userData.problems })
  });
  showScreen('screen-goals');
};

// Цели ухода (мультивыбор)
let selectedGoals = [];
Array.from(document.getElementsByClassName('goal-btn')).forEach(btn => {
  btn.onclick = () => {
    const val = btn.dataset.goal;
    if (selectedGoals.includes(val)) {
      selectedGoals = selectedGoals.filter(g => g !== val);
      btn.classList.remove('selected');
    } else {
      selectedGoals.push(val);
      btn.classList.add('selected');
    }
  };
});
const btnGoalsNext = document.getElementById('btn-goals-next');
if (btnGoalsNext) btnGoalsNext.onclick = async () => {
  userData.goals = selectedGoals.join(', ');
  await fetch('/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail, goals: userData.goals })
  });
  showScreen('screen-steps');
};

// Количество шагов
Array.from(document.getElementsByClassName('steps-btn')).forEach(btn => {
  btn.onclick = async () => {
    userData.steps = btn.dataset.steps;
    await fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, steps: userData.steps })
    });
    showScreen('screen-country');
  };
});

// Страна
Array.from(document.getElementsByClassName('country-btn')).forEach(btn => {
  btn.onclick = async () => {
    userData.country = btn.dataset.country;
    await fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, country: userData.country })
    });
    showScreen('screen-budget');
  };
});

// Бюджет
Array.from(document.getElementsByClassName('budget-btn')).forEach(btn => {
  btn.onclick = async () => {
    userData.budget = btn.dataset.budget;
    await fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, budget: userData.budget })
    });
    showScreen('screen-loading');
    setTimeout(() => {
      // После "подбора" показать календарь
      document.querySelectorAll('.app-screen').forEach(div => div.style.display = 'none');
      document.querySelector('.today-section').style.display = '';
      document.querySelector('.calendar-section').style.display = '';
      document.querySelector('.add-procedure-section').style.display = '';
      document.querySelector('.stats-section').style.display = '';
    }, 1500);
  };
});

// Инициализация приложения
function init() {
  loadData();
  updateTodaySection();
  createCalendar();
  updateStats();
  
  // Обработчики событий
  document.getElementById('addProcedure').addEventListener('click', addProcedure);
  document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
  document.getElementById('saveProcedure').addEventListener('click', saveProcedure);
  document.getElementById('deleteProcedure').addEventListener('click', deleteProcedure);
  
  // Закрытие модального окна
  document.querySelector('.close').addEventListener('click', closeModal);
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('editModal')) {
      closeModal();
    }
  });
  
  // Глобальные функции для onclick
  window.completeProcedure = completeProcedure;
  window.editProcedure = editProcedure;
  window.selectDate = selectDate;
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init); 
