from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return 'Telegram Mini App backend is running!'

# Пример эндпоинта для сохранения процедур (можно расширить)
@app.route('/api/procedure', methods=['POST'])
def add_procedure():
    data = request.json
    # Здесь можно добавить сохранение в БД или файл
    print('Получена процедура:', data)
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True)
