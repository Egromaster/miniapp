import os
import asyncio
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from telegram import InlineKeyboardMarkup, InlineKeyboardButton, Update
from telegram.ext import Application, CommandHandler, ContextTypes

# Загрузка токена из .env
load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")

# ========== Flask App ==========
app = Flask(__name__)
CORS(app)

user_data = []
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return 'Backend работает!'

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'error': 'Данные не получены'}), 400
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'status': 'error', 'error': 'Все поля обязательны!'}), 400
    for user in user_data:
        if user.get('email', '').lower() == email.lower():
            return jsonify({'status': 'error', 'error': 'Пользователь уже существует'}), 400
    user_data.append({'name': name, 'email': email, 'password': password})
    return jsonify({'status': 'ok'})

@app.route('/api/upload_selfie', methods=['POST'])
def upload_selfie():
    if 'photo' not in request.files:
        return jsonify({'status': 'error', 'error': 'Файл не найден'}), 400
    file = request.files['photo']
    email = request.form.get('email')
    if not email:
        return jsonify({'status': 'error', 'error': 'Email обязателен'}), 400
    if not any(user.get('email') == email for user in user_data):
        return jsonify({'status': 'error', 'error': 'Пользователь не найден'}), 400
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'status': 'error', 'error': 'Недопустимый файл'}), 400
    file.seek(0, os.SEEK_END)
    if file.tell() > MAX_FILE_SIZE:
        return jsonify({'status': 'error', 'error': 'Файл слишком большой'}), 400
    file.seek(0)
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = secure_filename(f"selfie_{email}.{ext}")
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({'status': 'ok', 'message': 'Фото загружено'})

# ========== Telegram Bot ==========

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    welcome_text = """
👋 Привет!  

Добро пожаловать в Smooth — твой персональный мобильный помощник по уходу за кожей.  

✅ Персональный подбор средств  
✅ Календарь ухода  
✅ Отслеживание эффективности  
✅ Анализ кожи с AI  

Нажми кнопку ниже, чтобы начать ⤵️
    """
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("Открыть приложение", url="https://t.me/firstttttttttry_bot?start=profile")]
    ])
    if update.message:
        await update.message.reply_text(text=welcome_text, parse_mode="Markdown", reply_markup=keyboard)

async def run_bot():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    print("🤖 Бот запущен!")
    await app.run_polling()

def start_bot_thread():
    asyncio.run(run_bot())

# ========== Запуск обоих ==========
if __name__ == '__main__':
    threading.Thread(target=start_bot_thread, daemon=True).start()
    app.run(host="0.0.0.0", port=80, debug=True)
