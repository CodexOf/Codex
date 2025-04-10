from flask import Flask, send_from_directory, render_template_string

app = Flask(__name__, static_folder='static')

# Главная страница (оригинальный index.html)
@app.route('/')
def home():
    return send_from_directory('.', 'index.html')

# SPA-контент
@app.route('/app-content')
def app_content():
    return """
    <div class="container" id="app">
      <!-- Вставьте сюда ВЕСЬ контент из index.html кроме кнопки -->
      <h1>Ваш контент</h1>
      <!-- ... -->
    </div>
    <script src="/static/js/app.js"></script>
    """

# Статические файлы
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Fallback для SPA
@app.route('/app')
@app.route('/<path:path>')
def catch_all(path=None):
    return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    app.run(port=5000)