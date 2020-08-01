import eventlet
eventlet.monkey_patch()  # noqa

import os
import secrets

from flask import Flask, render_template, abort, redirect, url_for, request
from flask_socketio import SocketIO, emit, join_room
from dotenv import load_dotenv

from .connect4 import init_state, check_victory


load_dotenv()

app = Flask(__name__)
app.config['secret'] = os.environ['CONNECT4_SECRET']
socketio = SocketIO(app, cookie=False, cors_allowed_origins="*")

games = {}


@app.route('/')
def index():
    unfinished = [token for token, game in games.items() if game['winner'] is None]
    return render_template('index.html', unfinished=unfinished)


@app.route('/game', methods=['POST'])
def new_game():
    token = secrets.token_hex(16)
    games[token] = init_state()
    return redirect(url_for('show_game', token=token))


@app.route('/game', methods=['GET'])
def game_redirect():
    if 'token' not in request.args:
        abort(404)

    token = request.args['token']
    if token not in games:
        abort(404)
    return redirect(url_for('show_game', token=token))


@app.route('/game/<token>', methods=['GET'])
def show_game(token):
    if token not in games:
        abort(404)
    return render_template('game.html', token=token)


@socketio.on('connect')
def on_connect():
    '''Get's called when a new client connects to the socket'''
    # emit only sends to the client that made the request
    # socketio.emit sends to all clients
    # emit('state_change', state)


@socketio.on('join')
def on_join(data):
    token = data['token']
    if token not in games:
        return

    join_room(token)
    # returned data gets send to the ack callback on the client side
    # here we return the current state of the game to the newly joined player
    return games[token]


@socketio.on('move')
def on_move(data):
    token = data['token']
    if token not in games:
        return

    game = games[token]

    if data['player'] != game['player']:
        return False

    col = data['col']

    for row in game['board']:
        if row[col] == 0:
            row[col] = data['player']
            game['player'] = 2 if game['player'] == 1 else 1
            game['winner'] = check_victory(game['board'])
            socketio.emit('state_change', game, room=token)
            break


if __name__ == '__main__':
    socketio.run(app)
