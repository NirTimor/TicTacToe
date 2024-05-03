const boardElement = document.getElementById('board');
let gameState = 'active';
let movesMade = 0;

function initBoard() {
    for (let row = 0; row < 3; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 3; col++) {
            const td = document.createElement('td');
            td.dataset.row = row;
            td.dataset.col = col;
            td.textContent = '';
            tr.appendChild(td);
        }
        boardElement.appendChild(tr);
    }
}

function setupGame() {
    const existingRematchButton = document.getElementById('rematch-button');
    if (existingRematchButton) {
        existingRematchButton.remove();
    }
    gameState = 'active';
    const initialState = JSON.parse(localStorage.getItem('initialState'));
    if (initialState) {
        boardElement.innerHTML = initialState;
    }
    fetch('http://localhost:5000/reset_game', { method: 'POST' })
        .then(() => console.log('Game reset on the server side.'))
        .catch(error => console.error('Error resetting the game:', error));
}
document.addEventListener('DOMContentLoaded', setupGame);

function checkWin() {
    const cells = boardElement.querySelectorAll('td');
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], 
        [0, 3, 6], [1, 4, 7], [2, 5, 8], 
        [0, 4, 8], [2, 4, 6] 
    ];
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;

        if (cells[a].textContent.trim() !== '' && 
        cells[a].textContent.trim() === cells[b].textContent.trim() && 
        cells[a].textContent.trim() === cells[c].textContent.trim()) {
            const winner = cells[a].textContent.trim();
            gameState = 'won';           
            handleEndGame(`${winner} wins!`);
            return true;
        }
    }
    if (movesMade === 9) {
        gameState = 'draw';
        handleEndGame('It\'s a Draw!');
        return true;
    }
    return false;
}

function resetGame() {
    gameState = 'active';
    movesMade = 0;
    document.getElementById('message').textContent = '';
    boardElement.removeEventListener('click', handleMove);
    boardElement.querySelectorAll('td').forEach(td => (td.textContent = ''));
    const rematchButton = document.getElementById('rematch-button');
    if (rematchButton) {
        rematchButton.style.display = 'none';
    }
    fetch('http://localhost:5000/reset_game', { method: 'POST' })
    .then(() => {
        console.log('Game reset on server side.');
        updateBoard();
        boardElement.addEventListener('click', handleMove);
        })
        .catch(error => console.error('Error resetting the game:', error));
}

function resetBoard() {
    boardElement.removeEventListener('click', handleMove);
    boardElement.addEventListener('click', handleMove);
    const rows = boardElement.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            cell.textContent = '';
        });
    });
    document.getElementById('message').textContent = '';
}

function handleEndGame(message) {
    updateBoard(); 
    boardElement.removeEventListener('click', handleMove); 
    setTimeout(() => {
        const existingRematchButton = document.getElementById('rematch-button');
        if (!existingRematchButton) {
            const rematchButton = document.createElement('button');
            rematchButton.id = 'rematch-button';
            rematchButton.textContent = 'Rematch!';
            rematchButton.addEventListener('click', () => {
                resetGame();
                rematchButton.remove(); 
            });
            document.getElementById('modal-content').appendChild(rematchButton);
        }
        else {
            existingRematchButton.style.display = 'block';
        }

    }, 300); 
}

function handleMove(event) {
    if (gameState !== 'active') {
        return;
    }
    const td = event.target;
    const row = td.dataset.row;
    const col = td.dataset.col;
    
    fetch('http://localhost:5000/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "row": row, "col": col }),
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            if (data.message === 'Move successful') {
                td.textContent = 'X'; 
                movesMade++;
                updateBoard();
            } else {
                alert(data.message);
                handleEndGame(data.message);
            }
        })
        .catch(error => console.error('Error making a move:', error));
}

function updateBoard() {
    fetch('http://localhost:5000/board')
        .then(response => response.json())
        .then(data => {
            const boardState = data.board;
            const cells = boardElement.querySelectorAll('td');
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    cells[i * 3 + j].textContent = boardState[i][j];
                }
            }
        })
        .catch(error => console.error('Error updating board from server:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    const existingRematchButton = document.getElementById('rematch-button');
    const initialState = JSON.parse(localStorage.getItem('initialState'));
    if (initialState) {
        boardElement.innerHTML = initialState;
    }
    fetch('http://localhost:5000/reset_game', { method: 'POST' })
        .then(() => {
            updateBoard();
        })
        .catch(error => console.error('Error resetting the game:', error));
});

initBoard();
boardElement.addEventListener('click', handleMove);

