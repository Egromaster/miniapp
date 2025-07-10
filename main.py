from flask import Flask, request, jsonify
from openpyxl import Workbook, load_workbook
import os

app = Flask(__name__)

EXCEL_FILE = 'users.xlsx'

# Инициализация Excel-файла, если не существует
def init_excel():
    if not os.path.exists(EXCEL_FILE):
        wb = Workbook()
        ws = wb.active
        ws.append([
            'Email', 'Name', 'Password', 'Gender', 'Age', 'SkinType', 'Problems', 'Goals', 'Steps', 'Country', 'Budget'
        ])
        wb.save(EXCEL_FILE)

init_excel()

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not (name and email and password):
        return jsonify({'status': 'error', 'message': 'Missing fields'}), 400

    wb = load_workbook(EXCEL_FILE)
    ws = wb.active
    # Проверка уникальности email
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0] == email:
            return jsonify({'status': 'error', 'message': 'User already exists'}), 400
    # Добавление пользователя
    ws.append([
        email, name, password, '', '', '', '', '', '', '', ''
    ])
    wb.save(EXCEL_FILE)
    return jsonify({'status': 'ok'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not (email and password):
        return jsonify({'status': 'error', 'message': 'Missing fields'}), 400

    wb = load_workbook(EXCEL_FILE)
    ws = wb.active
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0] == email and row[2] == password:
            return jsonify({'status': 'ok'})
    return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401

@app.route('/update', methods=['POST'])
def update():
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'status': 'error', 'message': 'Missing email'}), 400

    update_fields = {
        'gender': 3,
        'age': 4,
        'skin_type': 5,
        'problems': 6,
        'goals': 7,
        'steps': 8,
        'country': 9,
        'budget': 10
    }

    wb = load_workbook(EXCEL_FILE)
    ws = wb.active
    found = False
    for row in ws.iter_rows(min_row=2):
        if row[0].value == email:
            found = True
            for field, col in update_fields.items():
                if field in data:
                    row[col].value = data[field]
            break
    if not found:
        return jsonify({'status': 'error', 'message': 'User not found'}), 404
    wb.save(EXCEL_FILE)
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True)
