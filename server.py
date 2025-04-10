from flask import Flask, render_template, send_from_directory

app = Flask(__name__, 
            template_folder='templates',
            static_folder='static',
            static_url_path='/static')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/content')
def content():
    return render_template('content.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run()