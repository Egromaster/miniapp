from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Временное хранилище пользователей
users = []
user_data = []  # Хранилище для полных данных пользователей

# Конфигурация для загрузки файлов
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
    # Проверка на уникальность email
    for user in users:
        if user['email'].lower() == email.lower():
            return jsonify({'status': 'error', 'error': 'Пользователь с такой почтой уже существует!'}), 400
    users.append({'name': name, 'email': email, 'password': password})
    return jsonify({'status': 'ok'})

@app.route('/api/save_user_data', methods=['POST'])
def save_user_data():
    try:
        data = request.json
        if not data:
            return jsonify({'status': 'error', 'error': 'Данные не получены'}), 400
        
        # Проверяем, есть ли пользователь с таким email
        user_email = data.get('email')
        if not user_email:
            return jsonify({'status': 'error', 'error': 'Email обязателен'}), 400
        
        # Обновляем или добавляем данные пользователя
        existing_user = None
        for i, user in enumerate(user_data):
            if user.get('email') == user_email:
                existing_user = i
                break
        
        if existing_user is not None:
            # Обновляем существующие данные
            user_data[existing_user].update(data)
        else:
            # Добавляем новые данные
            user_data.append(data)
        
        print(f"Сохранены данные пользователя: {user_email}")
        print(f"Полные данные: {data}")
        
        return jsonify({'status': 'ok', 'message': 'Данные успешно сохранены'})
        
    except Exception as e:
        print(f"Ошибка при сохранении данных: {str(e)}")
        return jsonify({'status': 'error', 'error': 'Ошибка сервера'}), 500

@app.route('/api/upload_selfie', methods=['POST'])
def upload_selfie():
    try:
        if 'photo' not in request.files:
            return jsonify({'status': 'error', 'error': 'Файл не найден'}), 400
        
        file = request.files['photo']
        email = request.form.get('email')
        
        if not email:
            return jsonify({'status': 'error', 'error': 'Email обязателен'}), 400
        
        if file.filename == '':
            return jsonify({'status': 'error', 'error': 'Файл не выбран'}), 400
        
        # Сохраняем файл с именем, основанным на email
        filename = secure_filename(f"selfie_{email}.jpg")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        print(f"Селфи сохранен для {email}: {filepath}")
        
        return jsonify({'status': 'ok', 'message': 'Фото успешно загружено'})
        
    except Exception as e:
        print(f"Ошибка при загрузке селфи: {str(e)}")
        return jsonify({'status': 'error', 'error': 'Ошибка сервера'}), 500

@app.route('/api/get_user_data', methods=['GET'])
def get_user_data():
    """Получить все данные пользователей (для отладки)"""
    return jsonify({'status': 'ok', 'data': user_data})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


