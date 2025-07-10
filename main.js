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
        alert('Пожалуйста, заполните все поля!');
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
          alert('Ошибка регистрации: ' + (data.error || 'Попробуйте позже.'));
        }
      } catch (e) {
        alert('Ошибка соединения с сервером.');
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
          alert('Не удалось получить доступ к камере');
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
            alert('Фото успешно сохранено!');
            onSelfieSuccess();
          } else {
            alert('Ошибка загрузки фото: ' + (data.error || 'Попробуйте позже.'));
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
        alert('Фото успешно сохранено!');
        onSelfieSuccess();
      } else {
        alert('Ошибка загрузки фото: ' + (data.error || 'Попробуйте позже.'));
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

  // Удалён обработчик для кнопки 'Посмотреть подбор', теперь она не выполняет никаких действий
});
