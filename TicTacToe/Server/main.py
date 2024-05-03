from flask import Flask, jsonify, request
from flask_cors import CORS
import random
app = Flask(__name__)
CORS(app)

board = [[' ' for _ in range(3)] for _ in range(3)]
player_symbol = 'X'
computer_symbol = 'O'


@app.route('/reset_game', methods=['POST'])
def reset_game():
    global board
    board = [[' ' for _ in range(3)] for _ in range(3)]
    return jsonify({'message': 'Game has been reset successfuly!'})


@app.route('/play', methods=['POST'])
def play():
    global board
    data = request.get_json()
    try:
        row = int(data['row'])
        col = int(data['col'])
    except ValueError:
        return jsonify({'message': 'Invalid row or col value!'}), 400

    if 0 <= row < 3 and 0 <= col < 3:
        if board[row][col] == ' ':
            board[row][col] = player_symbol
            winner = check_winner()
            if winner:
                return jsonify({'message': f'Player {winner} Wins!', 'current_player': 'none'})

            if moves_left():
                computer_move()

                winner = check_winner()
                if winner:
                    return jsonify({'message': f'Player {winner} Wins!', 'current_player': 'none'})

                if moves_left():
                    return jsonify({'message': 'Move successful', 'current_player': player_symbol})
                else:
                    return jsonify({'message': "It's a draw!", 'current_player': 'none'})
            else:
                return jsonify({'message': "It's a draw!", 'current_player': 'none'})
        else:
            return jsonify({'message': 'Invalid move: Cell already occupied'}), 400
    else:
        return jsonify({'message': 'Invalid row or col value'}), 400


def moves_left():
    for row in board:
        for cell in row:
            if cell == ' ':
                return True
    return False


def computer_move():
    empty_cells = [(i, j) for i in range(3) for j in range(3) if board[i][j] == ' ']
    if empty_cells:
        row, col = random.choice(empty_cells)
        board[row][col] = computer_symbol


def check_winner():
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ]

    for combination in winning_combinations:
        a, b, c = combination
        if board[a // 3][a % 3] == board[b // 3][b % 3] == board[c // 3][c % 3] != ' ':
            return board[a // 3][a % 3]

    return None


@app.route('/board', methods=['GET'])
def get_board():
    return jsonify({'board': board, 'current_player': player_symbol})


if __name__ == '__main__':
    app.run(host="localhost", port=5000, debug=True)
