from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
board = [[' ' for _ in range(3)] for _ in range(3)]
curr_player = 'X'
CORS(app)


@app.route('/reset', methods=['POST'])
def reset():
    global board, curr_player
    board = [[' ' for _ in range(3)] for _ in range(3)]
    curr_player = 'X'
    return jsonify({'message': 'Game has been reset'})


@app.route('/reset_game', methods=['POST'])
def reset_game():
    global board, curr_player
    board = [[' ' for _ in range(3)] for _ in range(3)]
    curr_player = 'X'
    return jsonify({'message': 'Game has been reset'})


@app.route('/play', methods=['POST'])
def play():
    global board, curr_player
    data = request.get_json()
    try:
        row = int(data['row'])
        col = int(data['col'])
    except ValueError:
        return jsonify({'message': 'Invalid row or col value'}), 400

    if 0 <= row < 3 and 0 <= col < 3:
        if board[row][col] == ' ':
            board[row][col] = curr_player
            curr_player = 'O' if curr_player == 'X' else 'X'
            return jsonify({'message': 'Move successful', 'current_player': curr_player})
        else:
            return jsonify({'message': 'Invalid move'}), 400
    else:
        return jsonify({'message': 'Invalid row or col value'}), 400


@app.route('/board', methods=['GET'])
def get_board():
    return jsonify({'board': board, 'current_player': curr_player})


if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True)

