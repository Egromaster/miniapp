// Telegram Mini App инициализация
(function() {
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready(); // Сообщаем Telegram, что всё готово

    // Пример: получаем данные пользователя
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      const user = tg.initDataUnsafe.user;
      // Можно отобразить имя пользователя в интерфейсе, если нужно
      // Например, document.getElementById('userName').textContent = user.first_name;
      console.log('Пользователь Telegram:', user);
    }

    // Пример: меняем цветовую тему под Telegram
    if (tg.themeParams && tg.themeParams.bg_color) {
      document.body.style.background = tg.themeParams.bg_color;
    }

    // Можно добавить обработку MainButton, BackButton и других событий
    // tg.MainButton.setText('Сохранить');
    // tg.MainButton.show();
    // tg.onEvent('mainButtonClicked', () => { ... });
  } else {
    console.log('Не внутри Telegram Mini App');
  }
})();

// Показать экран регистрации по клику на кнопку
const btnRegister = document.getElementById('btn-register');
const screenWelcome = document.getElementById('screen-welcome');
const screenRegister = document.getElementById('screen-register');
const screenSelfie = document.getElementById('screen-selfie');

if (btnRegister && screenRegister && screenWelcome) {
  btnRegister.addEventListener('click', () => {
    screenWelcome.style.display = 'none';
    screenRegister.style.display = 'flex';
  });
}

// Отправка данных регистрации на backend
const btnDoRegister = document.getElementById('btn-do-register');
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
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.status === 'ok') {
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

// --- Селфи: камера и загрузка ---
const btnTakeSelfie = document.getElementById('btn-take-selfie');
const selfieVideo = document.getElementById('selfieVideo');
const selfieCanvas = document.getElementById('selfieCanvas');
const selfiePlaceholder = document.getElementById('selfiePlaceholder');
const selfieFile = document.getElementById('selfieFile');

let selfieStream = null;

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
        formData.append('email', document.getElementById('reg-email').value.trim());
        const res = await fetch('/api/upload_selfie', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.status === 'ok') {
          alert('Фото успешно сохранено!');
          // Здесь можно добавить анализ фото или переход к следующему шагу
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
    formData.append('email', document.getElementById('reg-email').value.trim());
    const res = await fetch('/api/upload_selfie', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.status === 'ok') {
      alert('Фото успешно сохранено!');
      // Здесь можно добавить анализ фото или переход к следующему шагу
    } else {
      alert('Ошибка загрузки фото: ' + (data.error || 'Попробуйте позже.'));
    }
  });
}
