from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'selfies'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app = Flask(__name__)

# Временное хранилище пользователей в памяти
users = []

@app.route('/')
def index():
    return 'Telegram Mini App backend is running!'

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'status': 'error', 'error': 'Все поля обязательны!'}), 400
    # Проверка на уникальность email
    for user in users:
        if user['email'].lower() == email.lower():
            return jsonify({'status': 'error', 'error': 'Пользователь с такой почтой уже существует!'}), 400
    users.append({'name': name, 'email': email, 'password': password, 'photo_path': ''})
    return jsonify({'status': 'ok'})

@app.route('/api/upload_selfie', methods=['POST'])
def upload_selfie():
    email = request.form.get('email')
    photo = request.files.get('photo')
    if not email or not photo:
        return jsonify({'status': 'error', 'error': 'Нет email или фото'}), 400
    filename = secure_filename(f'{email.replace("@", "_").replace(".", "_")}.jpg')
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    photo.save(filepath)
    # Сохраняем путь к фото в памяти
    for user in users:
        if user['email'].lower() == email.lower():
            user['photo_path'] = filepath
            break
    else:
        return jsonify({'status': 'error', 'error': 'Пользователь не найден'}), 404
    return jsonify({'status': 'ok'})

@app.route('/api/procedure', methods=['POST'])
def add_procedure():
    data = request.json
    print('Получена процедура:', data)
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True)
    print('Получена процедура:', data)
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True)
