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
