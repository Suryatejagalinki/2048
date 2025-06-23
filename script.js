let board = [];
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
const GRID_SIZE = 4;
const gameBoard = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const bestScoreDisplay = document.getElementById('best-score');
const gameOverDisplay = document.getElementById('game-over');

function initializeGame() {
    // Create board matrix
    board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    
    // Reset score
    score = 0;
    updateScore();
    
    // Create grid cells
    gameBoard.innerHTML = '';
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        gameBoard.appendChild(cell);
    }
    
    // Add initial tiles
    addRandomTile();
    addRandomTile();
    
    // Hide game over screen
    gameOverDisplay.classList.remove('show');
}

function addRandomTile() {
    const emptyCells = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        renderTile(randomCell.row, randomCell.col, true);
    }
}

function renderTile(row, col, isNew = false) {
    const value = board[row][col];
    const cellIndex = row * GRID_SIZE + col;
    const cell = gameBoard.children[cellIndex];
    
    // Remove existing tile if any
    const existingTile = cell.querySelector('.tile');
    if (existingTile) {
        cell.removeChild(existingTile);
    }
    
    if (value !== 0) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value} ${isNew ? 'new' : ''}`;
        tile.textContent = value;
        cell.appendChild(tile);
        
        // Special style for tiles >= 1024 as they're getting large
        if (value >= 1024) {
            tile.style.fontSize = '1rem';
        } else if (value >= 128) {
            tile.style.fontSize = '1.2rem';
        }
    }
}

function renderAllTiles() {
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            renderTile(row, col);
        }
    }
}

function handleKeyPress(e) {
    if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        
        let moved = false;
        
        switch (e.key) {
            case 'ArrowUp':
                moved = moveTiles('up');
                break;
            case 'ArrowDown':
                moved = moveTiles('down');
                break;
            case 'ArrowLeft':
                moved = moveTiles('left');
                break;
            case 'ArrowRight':
                moved = moveTiles('right');
                break;
        }
        
        if (moved) {
            addRandomTile();
            if (isGameOver()) {
                gameOver();
            }
        }
    }
}

function handleSwipe() {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const minSwipeDistance = 50;
    
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipeDistance) {
        // Horizontal swipe
        if (dx > 0) {
            if (moveTiles('right')) {
                addRandomTile();
                if (isGameOver()) {
                    gameOver();
                }
            }
        } else {
            if (moveTiles('left')) {
                addRandomTile();
                if (isGameOver()) {
                    gameOver();
                }
            }
        }
    } else if (Math.abs(dy) > minSwipeDistance) {
        // Vertical swipe
        if (dy > 0) {
            if (moveTiles('down')) {
                addRandomTile();
                if (isGameOver()) {
                    gameOver();
                }
            }
        } else {
            if (moveTiles('up')) {
                addRandomTile();
                if (isGameOver()) {
                    gameOver();
                }
            }
        }
    }
}

function moveTiles(direction) {
    let moved = false;
    const newBoard = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    const merged = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
    
    // Define iteration order based on direction
    const rowStart = direction === 'down' ? GRID_SIZE - 1 : 0;
    const rowEnd = direction === 'down' ? -1 : GRID_SIZE;
    const rowStep = direction === 'down' ? -1 : 1;
    
    const colStart = direction === 'right' ? GRID_SIZE - 1 : 0;
    const colEnd = direction === 'right' ? -1 : GRID_SIZE;
    const colStep = direction === 'right' ? -1 : 1;
    
    for (let row = rowStart; row !== rowEnd; row += rowStep) {
        for (let col = colStart; col !== colEnd; col += colStep) {
            if (board[row][col] !== 0) {
                let newRow = row;
                let newCol = col;
                let currentValue = board[row][col];
                
                // Move as far as possible in the direction
                while (true) {
                    let nextRow = newRow;
                    let nextCol = newCol;
                    
                    if (direction === 'up') nextRow--;
                    else if (direction === 'down') nextRow++;
                    else if (direction === 'left') nextCol--;
                    else if (direction === 'right') nextCol++;
                    
                    // Check boundaries
                    if (nextRow < 0 || nextRow >= GRID_SIZE || nextCol < 0 || nextCol >= GRID_SIZE) {
                        break;
                    }
                    
                    // Check if can merge with next cell
                    if (newBoard[nextRow][nextCol] === currentValue && !merged[nextRow][nextCol]) {
                        newBoard[nextRow][nextCol] *= 2;
                        score += newBoard[nextRow][nextCol];
                        merged[nextRow][nextCol] = true;
                        moved = true;
                        break;
                    }
                    // Stop if next cell is occupied
                    else if (newBoard[nextRow][nextCol] !== 0) {
                        break;
                    }
                    // Move to empty cell
                    else {
                        newRow = nextRow;
                        newCol = nextCol;
                        moved = true;
                    }
                }
                
                // Update the new position
                if (newRow !== row || newCol !== col) {
                    newBoard[newRow][newCol] = currentValue;
                } else {
                    newBoard[row][col] = currentValue;
                }
            }
        }
    }
    
    if (moved) {
        board = newBoard;
        updateScore();
        renderAllTiles();
        return true;
    }
    
    return false;
}

function updateScore() {
    scoreDisplay.textContent = score;
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        bestScoreDisplay.textContent = bestScore;
    }
}

function isGameOver() {
    // Check for empty cells
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (board[row][col] === 0) {
                return false;
            }
        }
    }
    
    // Check for possible merges
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const value = board[row][col];
            
            // Check adjacent cells
            if (col < GRID_SIZE - 1 && board[row][col + 1] === value) {
                return false;
            }
            if (row < GRID_SIZE - 1 && board[row + 1][col] === value) {
                return false;
            }
        }
    }
    
    return true;
}

function gameOver() {
    gameOverDisplay.classList.add('show');
}

function resetGame() {
    initializeGame();
}

// Touch event handlers
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
}, { passive: true });

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    document.addEventListener('keydown', handleKeyPress);
});
