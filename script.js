document.addEventListener('keydown', control);

// Variabel global
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const grid = 20; // Ukuran tiap blok
const rows = canvas.height / grid;
const cols = canvas.width / grid;

// Matriks game untuk menyimpan balok yang sudah mendarat
const gameGrid = Array.from({ length: rows }, () => Array(cols).fill(0));

const tetrominoes = [
    [[1, 1, 1, 1]], // I shape
    [[1, 1], [1, 1]], // O shape
    [[0, 1, 0], [1, 1, 1]], // T shape
    [[1, 0, 0], [1, 1, 1]], // L shape
    [[0, 0, 1], [1, 1, 1]]  // J shape
];

let currentPiece = getRandomPiece();
let currentX = Math.floor(cols / 2) - Math.floor(currentPiece[0].length / 2);
let currentY = 0;
let gameOver = false;

function getRandomPiece() {
    return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar balok yang sudah mendarat
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (gameGrid[row][col]) {
                context.fillStyle = 'grey';
                context.fillRect(col * grid, row * grid, grid - 2, grid - 2);
            }
        }
    }

    // Gambar balok saat ini
    context.fillStyle = 'cyan';
    for (let row = 0; row < currentPiece.length; row++) {
        for (let col = 0; col < currentPiece[row].length; col++) {
            if (currentPiece[row][col]) {
                context.fillRect((currentX + col) * grid, (currentY + row) * grid, grid - 2, grid - 2);
            }
        }
    }

    // Tampilkan pesan game over jika gameOver adalah true
    if (gameOver) {
        context.font = 'bold 24px Arial'; // Atur ukuran font agar lebih kecil jika perlu
        context.fillStyle = 'white';
        context.textAlign = 'center'; // Pusatkan teks secara horizontal
        context.textBaseline = 'middle'; // Pusatkan teks secara vertikal
        context.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    }
}


function control(event) {
    if (!gameOver) {
        if (event.key === 'ArrowLeft') {
            moveLeft();
        } else if (event.key === 'ArrowRight') {
            moveRight();
        } else if (event.key === 'ArrowDown') {
            drop();
        } else if (event.key === 'ArrowUp') {
            rotate();
        }
    }
}

function moveLeft() {
    currentX--;
    if (collision()) {
        currentX++;
    }
    draw();
}

function moveRight() {
    currentX++;
    if (collision()) {
        currentX--;
    }
    draw();
}

function rotate() {
    const rotatedPiece = currentPiece[0].map((_, index) => currentPiece.map(row => row[index])).reverse();
    const originalPiece = currentPiece;

    currentPiece = rotatedPiece;
    if (collision()) {
        currentPiece = originalPiece; // Kembalikan jika ada tabrakan
    }
    draw();
}

function drop() {
    currentY++;
    if (collision()) {
        currentY--;

        // Tambahkan balok ke grid game
        for (let row = 0; row < currentPiece.length; row++) {
            for (let col = 0; col < currentPiece[row].length; col++) {
                if (currentPiece[row][col]) {
                    gameGrid[currentY + row][currentX + col] = 1;
                }
            }
        }

        // Periksa jika game over (ketika balok baru menabrak di atas)
        if (currentY === 0) {
            gameOver = true;
            draw();
            return; // Hentikan permainan
        }

        // Dapatkan balok baru
        currentPiece = getRandomPiece();
        currentX = Math.floor(cols / 2) - Math.floor(currentPiece[0].length / 2);
        currentY = 0;

        // Periksa apakah ada garis yang penuh dan perlu dihapus
        checkFullRows();
    }
    draw();
}

function collision() {
    for (let row = 0; row < currentPiece.length; row++) {
        for (let col = 0; col < currentPiece[row].length; col++) {
            if (currentPiece[row][col] &&
                (currentY + row >= rows || 
                 currentX + col < 0 || 
                 currentX + col >= cols || 
                 gameGrid[currentY + row][currentX + col])) {
                return true;
            }
        }
    }
    return false;
}

function checkFullRows() {
    let rowsToClear = [];
    for (let row = 0; row < rows; row++) {
        if (gameGrid[row].every(cell => cell !== 0)) {
            rowsToClear.push(row);
        }
    }

    if (rowsToClear.length > 0) {
        let animationFrame = 0;
        const animationInterval = setInterval(() => {
            animationFrame++;
            rowsToClear.forEach(row => {
                for (let col = 0; col < cols; col++) {
                    context.fillStyle = `rgba(255, 0, 0, ${1 - animationFrame * 0.1})`;
                    context.fillRect(col * grid, row * grid, grid - 2, grid - 2);
                }
            });
            if (animationFrame >= 10) {
                clearInterval(animationInterval);
                removeRows(rowsToClear);
            }
        }, 50);
    }
}

function removeRows(rowsToClear) {
    rowsToClear.forEach(row => {
        gameGrid.splice(row, 1); // Hapus baris penuh
        gameGrid.unshift(Array(cols).fill(0)); // Tambahkan baris kosong di atas
    });
    draw(); // Perbarui gambar setelah baris dihapus
}

// Memulai interval untuk menjatuhkan balok
setInterval(() => {
    if (!gameOver) {
        drop();
    }
}, 1000);

// Gambar pertama kali
draw();
