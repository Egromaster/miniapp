import asyncio
import os
from telegram import InlineKeyboardMarkup, InlineKeyboardButton, Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Хендлер команды /start
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_text = """
👋 Привет!  

Добро пожаловать в *Smooth* — твой персональный мобильный помощник по уходу за кожей.  

Здесь ты можешь:  
✅ Получить персональную подборку уходовых средств  
✅ Создать календарь ухода с напоминаниями  
✅ Отслеживать эффективность уходовых продуктов  
✅ Анализировать изменения кожи лица с AI-помощником  

Нажми кнопку ниже, чтобы начать ⤵️
    """

    # 👇 замените на имя вашего бота (username, без @)
    bot_username = "firstttttttttry_bot"
    app_url = f"https://t.me/{bot_username}?startapp"

    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🚀 Начать", url=app_url)]
    ])

    await update.message.reply_text(
        text=welcome_text,
        parse_mode="Markdown",
        reply_markup=keyboard
    )

# Запуск приложения
async def main():
    token = os.getenv('TELEGRAM_BOT_TOKEN')
    if not token:
        print("❌ Ошибка: Не найден токен бота!")
        print("Установите переменную окружения TELEGRAM_BOT_TOKEN")
        return

    application = Application.builder().token(token).build()
    application.add_handler(CommandHandler("start", start))

    print("✅ Бот запущен...")
    await application.run_polling()

if __name__ == '__main__':
    import sys
    if sys.platform.startswith('win'):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
