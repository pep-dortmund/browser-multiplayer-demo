import os
from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO
from dotenv import load_dotenv

from .connect4 import init_state, check_victory

load_dotenv()

app = Flask(__name__)
app.config['secret'] = os.environ['CONNECT4_SECRET']
socket = SocketIO(app)
state = init_state()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/state')
def get_state():
    return jsonify(state)


@socket.on('connect')
def on_connect():
    socket.emit('state_change', state)


@socket.on('reset')
def reset():
    global state
    state = init_state()
    socket.emit('state_change', state)


@socket.on('move')
def on_move(json):
    if json['player'] != state['player']:
        return False

    col = json['col']

    for row in state['board']:
        if row[col] == 0:
            row[col] = json['player']
            state['player'] = 2 if state['player'] == 1 else 1
            state['winner'] = check_victory(state['board'])
            socket.emit('state_change', state)
            break


if __name__ == '__main__':
    socket.run(app)
