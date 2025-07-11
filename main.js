document.addEventListener('DOMContentLoaded', function() {
  // Конфигурация API
  const AMVERA_BASE_URL = 'https://miniapp1-egromaster.amvera.io';

  const btnRegister = document.getElementById('btn-register');
  const screenWelcome = document.getElementById('screen-welcome');
  const screenRegister = document.getElementById('screen-register');
  const btnDoRegister = document.getElementById('btn-do-register');
  const screenSelfie = document.getElementById('screen-selfie');
  const btnTakeSelfie = document.getElementById('btn-take-selfie');
  const selfieVideo = document.getElementById('selfieVideo');
  const selfieCanvas = document.getElementById('selfieCanvas');
  const selfiePlaceholder = document.getElementById('selfiePlaceholder');
  const selfieFile = document.getElementById('selfieFile');
  let selfieStream = null;
  const screenGender = document.getElementById('screen-gender');
  const genderBtns = document.querySelectorAll('.gender-btn');
  const btnGenderNext = document.getElementById('btn-gender-next');
  let currentUser = {};
  const screenAge = document.getElementById('screen-age');
  const ageBtns = document.querySelectorAll('.age-btn');
  const btnAgeNext = document.getElementById('btn-age-next');
  const screenSkin = document.getElementById('screen-skin');
  const skinBtns = document.querySelectorAll('.skin-btn');
  const btnSkinNext = document.getElementById('btn-skin-next');
  const screenProblems = document.getElementById('screen-problems');
  const problemBtns = document.querySelectorAll('.problem-btn');
  const btnProblemsNext = document.getElementById('btn-problems-next');
  const screenGoals = document.getElementById('screen-goals');
  const goalBtns = document.querySelectorAll('.goal-btn');
  const btnGoalsNext = document.getElementById('btn-goals-next');
  const screenSteps = document.getElementById('screen-steps');
  const stepsBtns = document.querySelectorAll('.steps-btn');
  const btnStepsNext = document.getElementById('btn-steps-next');
  const screenCountry = document.getElementById('screen-country');
  const countryBtns = document.querySelectorAll('.country-btn');
  const btnCountryNext = document.getElementById('btn-country-next');
  const screenBudget = document.getElementById('screen-budget');
  const budgetBtns = document.querySelectorAll('.budget-btn');
  const btnBudgetNext = document.getElementById('btn-budget-next');
  const btnShowResult = document.getElementById('btn-show-result');
  const screenLoading = document.getElementById('screen-loading');
  const screenResult = document.getElementById('screen-result');
  const resultStepsList = document.getElementById('result-steps-list');

  if (btnRegister && screenRegister && screenWelcome) {
    btnRegister.addEventListener('click', () => {
      screenWelcome.style.display = 'none';
      screenRegister.style.display = 'flex';
    });
  }

  if (btnDoRegister) {
    btnDoRegister.addEventListener('click', async () => {
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      if (!name || !email || !password) {
        showMessage('Пожалуйста, заполните все поля!', 'error');
        return;
      }
      try {
        const res = await fetch(`${AMVERA_BASE_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.status === 'ok') {
          // Сохраняем данные пользователя
          currentUser.name = name;
          currentUser.email = email;
          currentUser.password = password;
          
          // Переход на экран селфи
          screenRegister.style.display = 'none';
          screenSelfie.style.display = 'flex';
        } else {
          showMessage('Ошибка регистрации: ' + (data.error || 'Попробуйте позже.'), 'error');
        }
      } catch (e) {
        showMessage('Ошибка соединения с сервером.', 'error');
      }
    });
  }

  // После успешной загрузки селфи — переход на экран выбора пола
  function showGenderScreen() {
    screenSelfie.style.display = 'none';
    screenGender.style.display = 'flex';
  }

  // Вызов showGenderScreen после успешной загрузки фото
  function onSelfieSuccess() {
    showGenderScreen();
  }

  // --- Селфи: камера и загрузка ---
  if (btnTakeSelfie) {
    btnTakeSelfie.addEventListener('click', async () => {
      // Запуск камеры
      if (!selfieStream) {
        try {
          selfieStream = await navigator.mediaDevices.getUserMedia({ video: true });
          selfieVideo.srcObject = selfieStream;
          selfieVideo.style.display = 'block';
          selfiePlaceholder.style.display = 'none';
        } catch (e) {
          showMessage('Не удалось получить доступ к камере', 'error');
          return;
        }
      } else {
        // Сохраняем фото
        selfieCanvas.width = selfieVideo.videoWidth;
        selfieCanvas.height = selfieVideo.videoHeight;
        selfieCanvas.getContext('2d').drawImage(selfieVideo, 0, 0);
        selfieCanvas.toBlob(async (blob) => {
          const formData = new FormData();
          formData.append('photo', blob, 'selfie.jpg');
          formData.append('email', currentUser.email);
          const res = await fetch(`${AMVERA_BASE_URL}/api/upload_selfie`, {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.status === 'ok') {
            showMessage('Фото успешно сохранено!', 'success');
            onSelfieSuccess();
          } else {
            showMessage('Ошибка загрузки фото: ' + (data.error || 'Попробуйте позже.'), 'error');
          }
        }, 'image/jpeg', 0.95);
      }
    });
  }

  if (selfieFile) {
    selfieFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('photo', file, 'selfie.jpg');
      formData.append('email', currentUser.email);
      const res = await fetch(`${AMVERA_BASE_URL}/api/upload_selfie`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.status === 'ok') {
        showMessage('Фото успешно сохранено!', 'success');
        onSelfieSuccess();
      } else {
        showMessage('Ошибка загрузки фото: ' + (data.error || 'Попробуйте позже.'), 'error');
      }
    });
  }

  // Логика выбора пола
  let selectedGender = null;
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedGender = btn.getAttribute('data-gender');
      genderBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      btnGenderNext.disabled = false;
    });
  });

  if (btnGenderNext) {
    btnGenderNext.addEventListener('click', () => {
      currentUser.gender = selectedGender;
      screenGender.style.display = 'none';
      screenAge.style.display = 'flex';
    });
  }

  // Логика выбора возраста
  let selectedAge = null;
  ageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedAge = btn.getAttribute('data-age');
      ageBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      btnAgeNext.disabled = false;
    });
  });

  if (btnAgeNext) {
    btnAgeNext.addEventListener('click', () => {
      currentUser.age = selectedAge;
      screenAge.style.display = 'none';
      screenSkin.style.display = 'flex';
    });
  }

  // Логика выбора типа кожи
  let selectedSkin = null;
  skinBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSkin = btn.getAttribute('data-skin');
      skinBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      btnSkinNext.disabled = false;
    });
  });

  if (btnSkinNext) {
    btnSkinNext.addEventListener('click', () => {
      currentUser.skin = selectedSkin;
      screenSkin.style.display = 'none';
      screenProblems.style.display = 'flex';
    });
  }

  // Логика выбора проблем кожи (множественный выбор)
  let selectedProblems = [];
  problemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-problem');
      if (btn.classList.contains('selected')) {
        btn.classList.remove('selected');
        selectedProblems = selectedProblems.filter(p => p !== value);
      } else {
        btn.classList.add('selected');
        selectedProblems.push(value);
      }
      btnProblemsNext.disabled = selectedProblems.length === 0;
    });
  });

  if (btnProblemsNext) {
    btnProblemsNext.addEventListener('click', () => {
      currentUser.problems = selectedProblems;
      screenProblems.style.display = 'none';
      screenGoals.style.display = 'flex';
    });
  }

  // Логика выбора целей ухода (множественный выбор)
  let selectedGoals = [];
  goalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-goal');
      if (btn.classList.contains('selected')) {
        btn.classList.remove('selected');
        selectedGoals = selectedGoals.filter(g => g !== value);
      } else {
        btn.classList.add('selected');
        selectedGoals.push(value);
      }
      btnGoalsNext.disabled = selectedGoals.length === 0;
    });
  });

  if (btnGoalsNext) {
    btnGoalsNext.addEventListener('click', () => {
      currentUser.goals = selectedGoals;
      screenGoals.style.display = 'none';
      screenSteps.style.display = 'flex';
    });
  }

  // Логика выбора количества ступеней ухода
  let selectedSteps = null;
  stepsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSteps = btn.getAttribute('data-steps');
      stepsBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      btnStepsNext.disabled = false;
    });
  });

  if (btnStepsNext) {
    btnStepsNext.addEventListener('click', () => {
      currentUser.steps = selectedSteps;
      screenSteps.style.display = 'none';
      screenCountry.style.display = 'flex';
    });
  }

  // Логика выбора страны-производителя
  let selectedCountry = null;
  countryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCountry = btn.getAttribute('data-country');
      countryBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      btnCountryNext.disabled = false;
    });
  });

  if (btnCountryNext) {
    btnCountryNext.addEventListener('click', () => {
      currentUser.country = selectedCountry;
      screenCountry.style.display = 'none';
      screenBudget.style.display = 'flex';
    });
  }

  // Логика выбора бюджета
  let selectedBudget = null;
  budgetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedBudget = btn.getAttribute('data-budget');
      budgetBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      btnBudgetNext.disabled = false;
    });
  });

  if (btnBudgetNext) {
    btnBudgetNext.addEventListener('click', async () => {
      currentUser.budget = selectedBudget;
      try {
        // Убираем знак рубля и делаем значения бюджета информативными
        const userToSave = { ...currentUser };
        if (userToSave.budget) {
          if (/до\s*1000/i.test(userToSave.budget)) {
            userToSave.budget = 'до 1000';
          } else if (/1000\s*-\s*3000/i.test(userToSave.budget)) {
            userToSave.budget = '1000-3000';
          } else if (/выше\s*3000/i.test(userToSave.budget)) {
            userToSave.budget = 'выше 3000';
          } else {
            userToSave.budget = userToSave.budget.replace(/[^0-9\-]/g, '');
          }
        }
        await fetch(`${AMVERA_BASE_URL}/api/save_user_data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userToSave)
        });
      } catch (e) {}
      // Показываем экран загрузки
      document.querySelectorAll('.app-screen').forEach(screen => screen.style.display = 'none');
      document.getElementById('screen-loading').style.display = 'flex';
    });
  }

  if (btnShowResult) {
    btnShowResult.addEventListener('click', async () => {
      document.querySelectorAll('.app-screen').forEach(screen => screen.style.display = 'none');
      screenLoading.style.display = 'flex';

      // Сохранить данные пользователя (если нужно)
      try {
        await fetch(`${AMVERA_BASE_URL}/api/save_user_data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentUser)
        });
      } catch (e) {}

      // Корректно определяем количество шагов (3, 5 или 7)
      let stepsCount = parseInt(currentUser.steps, 10);
      if (![3,5,7].includes(stepsCount)) stepsCount = 3;

      // Собираем параметры для API с проверкой на undefined
      const params = new URLSearchParams({
        skin_type: currentUser.skin || '',
        country: currentUser.country || '',
        price: (currentUser.budget || '').replace(/[^ 0-9\d\-]/g, ''),
        step: stepsCount,
        benefits: Array.isArray(currentUser.goals) ? currentUser.goals.join(',') : ''
      });
      const apiUrl = 'https://script.google.com/macros/s/AKfycbw-nsaSPmZpv8sCb58M8OH68xuXFsf0_WM8hsfL_xEx_iipCZwolBW5rDc7a5Bcsjio6w/exec?';
      const fullUrl = `${apiUrl}?${params}`;
      let data = null;
      try {
        const response = await fetch(fullUrl);
        data = await response.json();
      } catch (error) {
        data = null;
      }
      screenLoading.style.display = 'none';
      screenResult.style.display = 'flex';
      resultStepsList.innerHTML = '';
      // Словарь переводов целей ухода
      const goalTranslations = {
        'hydration': 'Увлажнение',
        'acne': 'Борьба с акне',
        'anti-age': 'Избавление от морщин',
        'pigmentation': 'Осветление пигментации',
        'soothing': 'Успокоение кожи',
        'matting': 'Матирование',
        'improvement': 'Общее улучшение кожи'
      };
      // Словарь переводов этапов ухода (stepKey)
      const stepTranslations = {
        'cleansing': 'Очищение',
        'toning': 'Тонизирование',
        'serum': 'Сыворотка',
        'moisturizing': 'Увлажнение',
        'protection': 'Защита',
        'exfoliation': 'Эксфолиация',
        'mask': 'Маска',
        'eye': 'Уход за глазами',
        'treatment': 'Лечение',
        'essence': 'Эссенция',
        'oil': 'Масло',
        'ampoule': 'Ампула',
        'spot': 'Точечное средство'
      };
      if (data && data.success && data.routine && Object.keys(data.routine).length > 0) {
        const stepsList = Object.keys(data.routine);
        lastRoutineData = data.routine;
        lastRoutineSteps = stepsList;
        for (let i = 0; i < stepsCount; i++) {
          const stepKey = stepsList[i] || '';
          const product = data.routine[stepKey] || {};
          const stepDiv = document.createElement('div');
          stepDiv.className = 'result-step';
          const numDiv = document.createElement('div');
          numDiv.className = 'result-step-number';
          numDiv.textContent = (i + 1).toString();
          const textDiv = document.createElement('div');
          // Переводим этап на русский
          const ruStep = stepTranslations[stepKey] || stepKey;
          if (stepKey && product.name) {
            textDiv.innerHTML = `<b>${ruStep}</b>: ${product.name}${product.brand ? ' (' + product.brand + ')' : ''}`;
          } else {
            textDiv.textContent = 'Нет предпочтений';
          }
          stepDiv.appendChild(numDiv);
          stepDiv.appendChild(textDiv);
          resultStepsList.appendChild(stepDiv);
        }
      } else {
        for (let i = 0; i < stepsCount; i++) {
          const stepDiv = document.createElement('div');
          stepDiv.className = 'result-step';
          const numDiv = document.createElement('div');
          numDiv.className = 'result-step-number';
          numDiv.textContent = (i + 1).toString();
          const textDiv = document.createElement('div');
          textDiv.textContent = 'Нет предпочтений';
          stepDiv.appendChild(numDiv);
          stepDiv.appendChild(textDiv);
          resultStepsList.appendChild(stepDiv);
        }
      }
    });
  }

  // --- Календарь: модальное окно ---
  const btnAddToCalendar = document.getElementById('btn-add-to-calendar');
  const calendarModal = document.getElementById('calendar-modal');
  const calendarProceduresList = document.getElementById('calendar-procedures-list');
  const calendarForm = document.getElementById('calendar-form');

  let lastRoutineData = null;
  let lastRoutineSteps = null;

  if (btnAddToCalendar) {
    btnAddToCalendar.addEventListener('click', () => {
      // Получаем данные из последнего подбора
      if (!lastRoutineData || !lastRoutineSteps) return;
      // Очищаем список процедур
      calendarProceduresList.innerHTML = '';
      lastRoutineSteps.forEach((stepKey, i) => {
        const product = lastRoutineData[stepKey] || {};
        const procDiv = document.createElement('div');
        procDiv.className = 'calendar-procedure-block';
        procDiv.style.marginBottom = '18px';
        // Название процедуры (название продукта)
        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.marginBottom = '4px';
        title.textContent = product.name || 'Без названия';
        procDiv.appendChild(title);
        // Этап
        const stepLabel = document.createElement('div');
        stepLabel.style.fontSize = '0.97em';
        stepLabel.style.color = '#666';
        stepLabel.style.marginBottom = '6px';
        stepLabel.textContent = `Этап: ${stepKey}`;
        procDiv.appendChild(stepLabel);
        // Частота
        const freqLabel = document.createElement('label');
        freqLabel.textContent = 'Частота:';
        freqLabel.style.marginRight = '8px';
        const freqSelect = document.createElement('select');
        freqSelect.name = `freq_${i}`;
        ['Каждый день','Через день','2 раза в неделю','1 раз в неделю','2 раза в день'].forEach(opt => {
          const o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          freqSelect.appendChild(o);
        });
        procDiv.appendChild(freqLabel);
        procDiv.appendChild(freqSelect);
        // Время суток (утро/вечер, чекбоксы)
        const timeOfDayLabel = document.createElement('div');
        timeOfDayLabel.textContent = 'Время приёма:';
        timeOfDayLabel.style.margin = '8px 0 2px 0';
        timeOfDayLabel.style.fontSize = '1em';
        timeOfDayLabel.style.color = '#444';
        procDiv.appendChild(timeOfDayLabel);
        const timeOfDayWrap = document.createElement('div');
        timeOfDayWrap.className = 'calendar-timeofday-wrap';
        [
          {label: 'Утро', value: 'Утро'},
          {label: 'Вечер', value: 'Вечер'}
        ].forEach((opt, idx) => {
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.name = `timeofday_${i}`;
          checkbox.value = opt.value;
          checkbox.id = `timeofday_${i}_${idx}`;
          const checkboxLabel = document.createElement('label');
          checkboxLabel.htmlFor = checkbox.id;
          checkboxLabel.textContent = opt.label;
          timeOfDayWrap.appendChild(checkbox);
          timeOfDayWrap.appendChild(checkboxLabel);
        });
        procDiv.appendChild(timeOfDayWrap);
        calendarProceduresList.appendChild(procDiv);
      });
      calendarModal.style.display = 'flex';
    });
  }

  // --- Календарь: просмотр всех процедур ---
  const calendarViewModal = document.getElementById('calendar-view-modal');
  const calendarViewList = document.getElementById('calendar-view-list');
  const btnCloseCalendarView = document.getElementById('btn-close-calendar-view');
  let calendarProcedures = [];

  // Открыть окно календаря после сохранения процедур
  if (calendarForm) {
    calendarForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Собираем данные по всем процедурам
      const formData = new FormData(calendarForm);
      const result = [];
      if (!lastRoutineSteps) return;
      lastRoutineSteps.forEach((stepKey, i) => {
        // Собираем значения чекбоксов времени суток
        const timeOfDay = [];
        calendarForm.querySelectorAll(`input[name="timeofday_${i}"]:checked`).forEach(cb => timeOfDay.push(cb.value));
        result.push({
          step: stepKey,
          product: lastRoutineData[stepKey]?.name || '',
          freq: formData.get(`freq_${i}`),
          timeOfDay: timeOfDay
        });
      });
      calendarProcedures = result;
      calendarModal.style.display = 'none';
      // Открываем окно просмотра календаря (месяц)
      const now = new Date();
      renderMonthCalendar(now.getFullYear(), now.getMonth());
      calendarViewModal.style.display = 'flex';
    });
  }

  function renderCalendarView() {
    if (!calendarViewList) return;
    calendarViewList.innerHTML = '';
    if (!calendarProcedures.length) {
      calendarViewList.innerHTML = '<div style="text-align:center;color:#888;">Нет процедур</div>';
      return;
    }
    // Словарь переводов этапов ухода (stepKey)
    const stepTranslations = {
      'cleansing': 'Очищение',
      'toning': 'Тонизирование',
      'serum': 'Сыворотка',
      'moisturizing': 'Увлажнение',
      'protection': 'Защита',
      'exfoliation': 'Эксфолиация',
      'mask': 'Маска',
      'eye': 'Уход за глазами',
      'treatment': 'Лечение',
      'essence': 'Эссенция',
      'oil': 'Масло',
      'ampoule': 'Ампула',
      'spot': 'Точечное средство'
    };
    calendarProcedures.forEach(proc => {
      const item = document.createElement('div');
      item.className = 'calendar-view-item';
      const title = document.createElement('div');
      title.className = 'calendar-view-title';
      title.textContent = proc.product || 'Без названия';
      item.appendChild(title);
      const step = document.createElement('div');
      step.className = 'calendar-view-step';
      const ruStep = stepTranslations[proc.step] || proc.step;
      step.textContent = `Этап: ${ruStep}`;
      item.appendChild(step);
      const freq = document.createElement('div');
      freq.className = 'calendar-view-freq';
      freq.textContent = `Частота: ${proc.freq}`;
      item.appendChild(freq);
      const timeOfDay = document.createElement('div');
      timeOfDay.className = 'calendar-view-timeofday';
      timeOfDay.textContent = `Время приёма: ${proc.timeOfDay.join(', ')}`;
      item.appendChild(timeOfDay);
      calendarViewList.appendChild(item);
    });
  }

  if (btnCloseCalendarView) {
    btnCloseCalendarView.addEventListener('click', function() {
      calendarViewModal.style.display = 'none';
    });
  }

  // --- Календарь: JS-логика для календаря месяца ---
  const calendarMonthView = document.getElementById('calendar-month-view');
  const calendarDayDetail = document.getElementById('calendar-day-detail');

  let calendarCurrentMonth = null;
  let calendarCurrentYear = null;

  function getMonthNameRu(monthIdx) {
    return ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'][monthIdx];
  }

  function renderMonthCalendar(year, month) {
    if (!calendarMonthView) return;
    calendarMonthView.innerHTML = '';
    // Header
    const header = document.createElement('div');
    header.className = 'calendar-header';
    const prevBtn = document.createElement('button');
    prevBtn.className = 'calendar-nav-btn';
    prevBtn.innerHTML = '&#8592;';
    prevBtn.onclick = () => renderMonthCalendar(month === 0 ? year-1 : year, month === 0 ? 11 : month-1);
    const nextBtn = document.createElement('button');
    nextBtn.className = 'calendar-nav-btn';
    nextBtn.innerHTML = '&#8594;';
    nextBtn.onclick = () => renderMonthCalendar(month === 11 ? year+1 : year, month === 11 ? 0 : month+1);
    const label = document.createElement('span');
    label.textContent = `${getMonthNameRu(month)} ${year}`;
    header.appendChild(prevBtn);
    header.appendChild(label);
    header.appendChild(nextBtn);
    calendarMonthView.appendChild(header);
    // Days of week
    const daysRow = document.createElement('div');
    daysRow.className = 'calendar-grid';
    ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].forEach(d => {
      const cell = document.createElement('div');
      cell.style.fontWeight = '600';
      cell.style.color = '#888';
      cell.textContent = d;
      daysRow.appendChild(cell);
    });
    calendarMonthView.appendChild(daysRow);
    // Dates grid
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    const firstDay = new Date(year, month, 1);
    let startIdx = (firstDay.getDay() + 6) % 7; // Пн=0
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const today = new Date();
    // Собираем процедуры по датам
    const procsByDate = {};
    if (calendarProcedures && calendarProcedures.length) {
      calendarProcedures.forEach(proc => {
        // Для примера: все процедуры добавляются на каждый день месяца согласно частоте и времени суток
        // (реализация частоты: только "Каждый день" и "2 раза в день" — каждый день, остальные — через день/раз в неделю и т.д.)
        let days = [];
        if (proc.freq === 'Каждый день' || proc.freq === '2 раза в день') {
          for (let d = 1; d <= daysInMonth; d++) days.push(d);
        } else if (proc.freq === 'Через день') {
          for (let d = 1; d <= daysInMonth; d+=2) days.push(d);
        } else if (proc.freq === '2 раза в неделю') {
          for (let d = 1; d <= daysInMonth; d++) if ([1,4].includes(new Date(year, month, d).getDay())) days.push(d); // Пн, Чт
        } else if (proc.freq === '1 раз в неделю') {
          for (let d = 1; d <= daysInMonth; d++) if (new Date(year, month, d).getDay() === 1) days.push(d); // Пн
        }
        days.forEach(d => {
          const key = d;
          if (!procsByDate[key]) procsByDate[key] = [];
          procsByDate[key].push(proc);
        });
      });
    }
    // Пустые ячейки до первого дня месяца
    for (let i = 0; i < startIdx; i++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      cell.style.background = 'none';
      cell.style.cursor = 'default';
      grid.appendChild(cell);
    }
    // Дни месяца
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell';
      if (today.getFullYear() === year && today.getMonth() === month && today.getDate() === d) {
        cell.classList.add('today');
      }
      cell.textContent = d;
      // Если есть процедуры — показываем краткие названия
      if (procsByDate[d] && procsByDate[d].length) {
        // Получаем переводы этапов
        const stepTranslations = {
          'cleansing': 'Очищение',
          'toning': 'Тонизирование',
          'serum': 'Сыворотка',
          'moisturizing': 'Увлажнение',
          'protection': 'Защита',
          'exfoliation': 'Эксфолиация',
          'mask': 'Маска',
          'eye': 'Уход за глазами',
          'treatment': 'Лечение',
          'essence': 'Эссенция',
          'oil': 'Масло',
          'ampoule': 'Ампула',
          'spot': 'Точечное средство'
        };
        // Собираем уникальные этапы процедур на этот день
        const shortNames = procsByDate[d].map(proc => stepTranslations[proc.step] || proc.step);
        // Оставляем максимум 2–3 названия, остальное — многоточие
        let displayNames = shortNames.slice(0, 3).join(', ');
        if (shortNames.length > 3) displayNames += ', ...';
        const procSpan = document.createElement('span');
        procSpan.className = 'calendar-proc-short';
        procSpan.textContent = displayNames;
        procSpan.style.display = 'block';
        procSpan.style.fontSize = '0.75em';
        procSpan.style.color = '#4ecdc4';
        procSpan.style.marginTop = '2px';
        cell.appendChild(procSpan);
      }
      cell.onclick = () => showDayDetail(year, month, d, procsByDate[d] || []);
      grid.appendChild(cell);
    }
    calendarMonthView.appendChild(grid);
    calendarCurrentMonth = month;
    calendarCurrentYear = year;
  }

  function showDayDetail(year, month, day, procs) {
    if (!calendarDayDetail) return;
    calendarDayDetail.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'calendar-day-detail-inner';
    const header = document.createElement('div');
    header.className = 'calendar-day-detail-header';
    header.innerHTML = `<span>${day} ${getMonthNameRu(month)} ${year}</span>`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'calendar-day-detail-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => { calendarDayDetail.style.display = 'none'; };
    header.appendChild(closeBtn);
    inner.appendChild(header);
    const list = document.createElement('div');
    list.className = 'calendar-day-detail-list';
    if (!procs.length) {
      list.innerHTML = '<div style="color:#888;text-align:center;">Нет процедур</div>';
    } else {
      procs.forEach(proc => {
        const item = document.createElement('div');
        item.style.marginBottom = '10px';
        item.innerHTML = `<b>${proc.product}</b><br>Этап: ${proc.step}<br>Частота: ${proc.freq}<br>Время: ${Array.isArray(proc.timeOfDay) ? proc.timeOfDay.join(', ') : proc.timeOfDay}`;
        list.appendChild(item);
      });
    }
    inner.appendChild(list);
    calendarDayDetail.appendChild(inner);
    calendarDayDetail.style.display = 'flex';
  }

  // Открывать календарь на текущем месяце при открытии окна
  if (calendarViewModal) {
    calendarViewModal.addEventListener('show', () => {
      const now = new Date();
      renderMonthCalendar(now.getFullYear(), now.getMonth());
    });
  }
  // Автоматически рендерить при открытии окна
  if (calendarViewModal) {
    const origDisplay = calendarViewModal.style.display;
    const observer = new MutationObserver(() => {
      if (calendarViewModal.style.display === 'flex') {
        const now = new Date();
        renderMonthCalendar(now.getFullYear(), now.getMonth());
      }
    });
    observer.observe(calendarViewModal, { attributes: true, attributeFilter: ['style'] });
  }

  // Удалён обработчик для кнопки 'Посмотреть подбор', теперь она не выполняет никаких действий
});

// Обработчик для ссылки на политику конфиденциальности (регистрация)
document.addEventListener('DOMContentLoaded', function() {
  const privacyLink = document.getElementById('privacy-link');
  if (privacyLink) {
    privacyLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.open('https://drive.google.com/file/d/1fwlCSkWskAojRClX3Mi956gWgl-7boPO/view?usp=sharing', '_blank');
    });
  }
});

// Функция для показа сообщений пользователю
function showMessage(text, type = 'info') {
  let msg = document.getElementById('message');
  if (!msg) {
    msg = document.createElement('div');
    msg.id = 'message';
    msg.style.position = 'fixed';
    msg.style.top = '24px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.zIndex = '9999';
    msg.style.padding = '12px 24px';
    msg.style.borderRadius = '8px';
    msg.style.background = type === 'error' ? '#ffdddd' : '#eafffa';
    msg.style.color = '#222';
    msg.style.fontWeight = '500';
    msg.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    document.body.appendChild(msg);
  }
  msg.textContent = text;
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 2500);
}
