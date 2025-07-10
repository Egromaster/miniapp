from flask import Flask, request, jsonify
import os
from openpyxl import Workbook, load_workbook

app = Flask(__name__)

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
    # Сохраняем в Excel
    file_path = 'users.xlsx'
    if not os.path.exists(file_path):
        wb = Workbook()
        ws = wb.active
        ws.append(['Имя', 'Почта', 'Пароль'])
        wb.save(file_path)
    wb = load_workbook(file_path)
    ws = wb.active
    ws.append([name, email, password])
    wb.save(file_path)
    return jsonify({'status': 'ok'})

# Пример эндпоинта для сохранения процедур (можно расширить)
@app.route('/api/procedure', methods=['POST'])
def add_procedure():
    data = request.json
    print('Получена процедура:', data)
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True)
