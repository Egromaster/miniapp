import asyncio
from telegram import InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import Application, CommandHandler

async def start(update, context):
    welcome_text = """
👋 Привет!  

Добро пожаловать в Smooth — твой персональный мобильный помощник по уходу за кожей.  

Здесь ты можешь:  

✅ Получить персональную подборку уходовых средств  
✅Создать календарь ухода с напоминаниями  
✅ Отслеживать эффективность уходовых продуктов  
✅ Анализировать изменения кожи лица с AI-помощником  

Нажми кнопку ниже, чтобы начать! ⤵️
    """
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("Открыть приложение", web_app={"url": "https://t.me/firstttttttttry_bot?profile"})]
    ])
    await update.message.reply_text(
        text=welcome_text,
        parse_mode="Markdown",
        reply_markup=keyboard
    )

async def main():
    application = Application.builder().token("YOUR_TELEGRAM_BOT_TOKEN").build()
    application.add_handler(CommandHandler("start", start))
    await application.run_polling()

if __name__ == '__main__':
    asyncio.run(main()) 
