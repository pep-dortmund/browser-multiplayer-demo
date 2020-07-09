import os
from flask import Flask, render_template, jsonify, abort, redirect, url_for, request
from flask_socketio import SocketIO, emit, join_room
from dotenv import load_dotenv

from .connect4 import init_state, check_victory

load_dotenv()

app = Flask(__name__)
app.config['secret'] = os.environ['CONNECT4_SECRET']
socketio = SocketIO(app)

games = []


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/game', methods=['POST'])
def new_game():
    games.append(init_state())
    return redirect(url_for('game', game_id=len(games) - 1))


@app.route('/game', methods=['GET'])
def game():
    game_id = request.args.get('game_id')
    if request.args.get('game_id') is None or int(game_id) >= len(games):
        abort(404)
    return render_template('game.html')


@app.route('/game/<int:game_id>')
def get_state(game_id):
    if id >= len(games) or id < 0:
        abort(404)
    return jsonify(games[game_id])


@socketio.on('connect')
def on_connect():
    # emit only sends to the client that made the request
    # socketio.emit sends to all clients
    # emit('state_change', state)
    print('new connction')


@socketio.on('join')
def on_join(data):
    game_id = int(data['game_id'])
    join_room(game_id)
    emit('state_change', games[game_id], room=game_id)


@socketio.on('move')
def on_move(data):
    game_id = int(data['game_id'])
    game = games[game_id]

    if data['player'] != game['player']:
        return False

    col = data['col']

    for row in game['board']:
        if row[col] == 0:
            row[col] = data['player']
            game['player'] = 2 if game['player'] == 1 else 1
            game['winner'] = check_victory(game['board'])
            socketio.emit('state_change', game, room=game_id)
            break


if __name__ == '__main__':
    socketio.run(app)
