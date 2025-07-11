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
        await fetch(`${AMVERA_BASE_URL}/api/save_user_data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentUser)
        });
      } catch (e) {
        // Можно добавить обработку ошибок
      }
      // Показываем экран загрузки
      document.querySelectorAll('.app-screen').forEach(screen => screen.style.display = 'none');
      document.getElementById('screen-loading').style.display = 'flex';
    });
  }

  if (btnShowResult) {
    btnShowResult.addEventListener('click', async () => {
      // Скрыть все экраны, показать лоадер
      document.querySelectorAll('.app-screen').forEach(screen => screen.style.display = 'none');
      screenLoading.style.display = 'flex';

      // Сохранить данные пользователя (если нужно)
      try {
        await fetch(`${AMVERA_BASE_URL}/api/save_user_data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentUser)
        });
      } catch (e) {
        // Можно добавить обработку ошибок
      }

      // Собрать параметры для API
      const params = new URLSearchParams({
        skin_type: currentUser.skin || '',
        country: currentUser.country || '',
        price: (currentUser.budget || '').replace(/[^\d\-]/g, ''),
        step: String(currentUser.steps || ''),
        benefits: (currentUser.goals || []).join(',')
      });
      const url = `https://script.google.com/macros/s/AKfycbwj-v_qjzcCBjz5SHjJ6-n_pOC0KcqxXGTmDTZPf0ZDivNAntgRYg0Dx60QMtUmHWM/exec?${params}`;
      let data = null;
      try {
        const response = await fetch(url);
        data = await response.json();
      } catch (error) {
        data = null;
      }
      // Скрыть лоадер, показать результат
      screenLoading.style.display = 'none';
      screenResult.style.display = 'flex';
      // Очистить список
      resultStepsList.innerHTML = '';
      // Определить количество шагов
      let stepsCount = parseInt(currentUser.steps || '0', 10);
      if (!stepsCount || stepsCount < 3) stepsCount = 3;
      if (stepsCount > 7) stepsCount = 7;
      // Если нет данных или данные не массив — выводим "Нет предпочтений"
      let steps = (data && Array.isArray(data.routine)) ? data.routine : null;
      for (let i = 0; i < stepsCount; i++) {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'result-step';
        const numDiv = document.createElement('div');
        numDiv.className = 'result-step-number';
        numDiv.textContent = (i + 1).toString();
        const textDiv = document.createElement('div');
        textDiv.textContent = steps && steps[i] ? steps[i] : 'Нет предпочтений';
        stepDiv.appendChild(numDiv);
        stepDiv.appendChild(textDiv);
        resultStepsList.appendChild(stepDiv);
      }
    });
  }

  // Удалён обработчик для кнопки 'Посмотреть подбор', теперь она не выполняет никаких действий
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

