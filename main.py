from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

user_data = []  # Хранилище для полных данных пользователей
UPLOAD_FOLDER = 'uploads'
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 МБ
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
    # Проверка на уникальность email по user_data
    for user in user_data:
        if user.get('email', '').lower() == email.lower():
            return jsonify({'status': 'error', 'error': 'Пользователь с такой почтой уже существует!'}), 400
    user_data.append({'name': name, 'email': email, 'password': password})
    return jsonify({'status': 'ok'})

@app.route('/api/save_user_data', methods=['POST'])
def save_user_data():
    try:
        data = request.json
        if not data:
            return jsonify({'status': 'error', 'error': 'Данные не получены'}), 400
        user_email = data.get('email')
        if not user_email:
            return jsonify({'status': 'error', 'error': 'Email обязателен'}), 400
        existing_user = None
        for i, user in enumerate(user_data):
            if user.get('email') == user_email:
                existing_user = i
                break
        if existing_user is not None:
            user_data[existing_user].update(data)
        else:
            user_data.append(data)
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
        # Проверяем, что email уже зарегистрирован
        if not any(user.get('email') == email for user in user_data):
            return jsonify({'status': 'error', 'error': 'Пользователь с таким email не найден'}), 400
        if file.filename == '' or file.filename is None:
            return jsonify({'status': 'error', 'error': 'Файл не выбран'}), 400
        if not allowed_file(file.filename):
            return jsonify({'status': 'error', 'error': 'Недопустимый тип файла'}), 400
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)
        if file_length > MAX_FILE_SIZE:
            return jsonify({'status': 'error', 'error': 'Файл слишком большой (макс. 5 МБ)'}), 400
        ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'jpg'
        filename = secure_filename(f"selfie_{email}.{ext}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return jsonify({'status': 'ok', 'message': 'Фото успешно загружено'})
    except Exception as e:
        print(f"Ошибка при загрузке селфи: {str(e)}")
        return jsonify({'status': 'error', 'error': 'Ошибка сервера'}), 500

@app.route('/api/get_user_data', methods=['GET'])
def get_user_data():
    """Получить все данные пользователей (для отладки)"""
    return jsonify({'status': 'ok', 'data': user_data})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)



