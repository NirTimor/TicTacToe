const boardElement = document.getElementById('board');
const rematchButton = document.getElementById('rematch-button');
let gameState = 'active'; 
let movesMade = 0; 
const modal = document.getElementById('modal');

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
        if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
            const winner = cells[a].textContent; 
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
    document.getElementById('rematch-button').style.display = 'none';
    boardElement.removeEventListener('click', handleMove);
    boardElement.querySelectorAll('td').forEach(td => (td.textContent = ''));
    boardElement.addEventListener('click', handleMove);
    clearLocalStorage();
    fetch('http://localhost:5000/reset_game', { method: 'POST' })
    .then(() => console.log('Game reset on server side.'))
    .catch(error => console.error('Error resetting the game:', error));
    setupGame();
}

function resetBoard() {
    clearLocalStorage();
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
    const existingRematchButton = document.getElementById('rematch-button');
    if (!existingRematchButton) {
        const rematchButton = document.createElement('button');
        rematchButton.id = 'rematch-button';
        rematchButton.textContent = 'Rematch!';
        rematchButton.addEventListener('click', () => {
            resetGame();
            modal.style.display = 'none';
        });

        document.getElementById('modal-content').appendChild(rematchButton);
    }

    setTimeout(() => {
        boardElement.removeEventListener('click', handleMove);
        alert(message);
        document.getElementById('rematch-button').style.display = 'block';
    }, 0);
}

function handleMove(event) {
    if (gameState === 'won' || gameState === 'draw') {
        return; 
    }
    const td = event.target;
    const row = td.dataset.row;
    const col = td.dataset.col;

    if (td.textContent === '') {
        fetch('http://localhost:5000/play', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "row": row, "col": col }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Move successful') {
                    td.textContent = data.current_player;
                    movesMade++;
                    if (checkWin()) {
                        boardElement.removeEventListener('click', handleMove);
                        return;
                    }
                } else {
                    alert('Invalid move. Try again.');
                }
            })
            .catch(error => console.error('Error making a move:', error));
    }
}

function clearLocalStorage() {
    localStorage.removeItem('initialState');
}


document.addEventListener('DOMContentLoaded', () => {
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
        .then(() => console.log('Game reset on server side.'))
        .catch(error => console.error('Error resetting the game:', error));
});

initBoard();
boardElement.addEventListener('click', handleMove);
resetButton.addEventListener('click', resetGame);
resetButton.addEventListener('click', resetBoard);
