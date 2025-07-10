from flask import Flask, request, jsonify

app = Flask(__name__)

# Временное хранилище пользователей
users = []

@app.route('/')
def index():
    return 'Backend работает!'

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
    users.append({'name': name, 'email': email, 'password': password})
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True)
