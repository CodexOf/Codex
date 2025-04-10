from flask import Flask, send_from_directory, render_template_string

app = Flask(__name__, static_folder='static', template_folder='templates')

# Главная страница (оригинальный index.html)
@app.route('/')
def home():
    return send_from_directory('templates', 'index.html')

# API для SPA-контента
@app.route('/app-content')
def app_content():
    return """
    <div class="container" id="app">
      <!-- Вставьте сюда ВЕСЬ контент из index.html, кроме кнопки -->
      <header class="header">...</header>
      <main class="main-content">...</main>
    </div>
    """

# Статические файлы
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(port=5000)