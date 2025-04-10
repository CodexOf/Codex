from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__,
            template_folder='templates',
            static_folder='static')

# Главная страница (без изменений)
@app.route('/')
def index():
    return render_template('index.html')

# SPA-приложение
@app.route('/app')
def app_route():
    return render_template('app.html')

# Статические файлы
@app.route('/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('static/css', filename)

@app.route('/static/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('static/js', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)