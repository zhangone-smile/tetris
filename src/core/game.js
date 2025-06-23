import { ref } from 'vue';
import { randomTetromino, TETROMINOES } from './tetrominoes';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

export const board = ref(createEmptyBoard());
export const score = ref(0);
export const lines = ref(0);
export const level = ref(0);
export const nextPiece = ref({ shape: [], color: '' });
export const isGameOver = ref(false);
export const shakeType = ref('');
export const dissolveRows = ref([]);
export const currentMode = ref('classic');
export const superBlindConfig = ref({
  showPieceTime: 500,  // 超级盲打模式下方块显示时间（毫秒）
  showLockTime: 500,   // 超级盲打模式下方块锁定后显示时间（毫秒）
});

export const player = ref({
  pos: { x: 0, y: 0 },
  tetromino: { shape: [], color: '' },
  collided: false,
});

export function startGame(mode = 'classic') {
  currentMode.value = mode;
  console.log('当前模式:', currentMode.value);
  // 根据模式设置不同的配置
  if (mode === 'superblind') {
    superBlindConfig.value = {
      showPieceTime: 500,
      showLockTime: 500
    };
  } else if (mode === 'blind') {
    superBlindConfig.value = {
      showPieceTime: 1000,
      showLockTime: 1000
    };
  }
  board.value = createEmptyBoard();
  score.value = 0;
  lines.value = 0;
  level.value = 0;
  isGameOver.value = false;
  nextPiece.value = randomTetromino();
  resetPlayer();
}

export function resetPlayer() {
  player.value.tetromino = JSON.parse(JSON.stringify(nextPiece.value));
  nextPiece.value = randomTetromino();
  player.value.pos.y = 0;
  player.value.pos.x =
    Math.floor(BOARD_WIDTH / 2) - Math.floor((player.value.tetromino.shape[0]?.length || 0) / 2);
  player.value.collided = false;
  console.log('resetPlayer', player.value.tetromino, 'pos.x:', player.value.pos.x, 'pos.y:', player.value.pos.y);

  // 只在真正重叠时game over
  const overlap = checkCollision(player.value, board.value, { x: 0, y: 0 });
  console.log('resetPlayer overlap:', overlap);
  if (overlap) {
    console.log('GAME OVER (resetPlayer overlap)');
    board.value = createEmptyBoard();
    isGameOver.value = true;
  }
}

export function checkCollision(player, board, { x: moveX, y: moveY }) {
  for (let y = 0; y < player.tetromino.shape.length; y += 1) {
    for (let x = 0; x < player.tetromino.shape[y].length; x += 1) {
      if (player.tetromino.shape[y][x] !== 0) {
        const boardY = y + player.pos.y + moveY;
        const boardX = x + player.pos.x + moveX;
        if (
          !board[boardY] ||
          typeof board[boardY][boardX] === 'undefined' ||
          board[boardY][boardX] !== 0
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

export function movePlayer(dir) {
  if (isGameOver.value) return;
  if (!checkCollision(player.value, board.value, { x: dir, y: 0 })) {
    player.value = {
      ...player.value,
      pos: { ...player.value.pos, x: player.value.pos.x + dir }
    };
  }
}

export function dropPlayer() {
  console.log('dropPlayer called, isGameOver:', isGameOver.value, 'pos.y:', player.value.pos.y);
  if (isGameOver.value) return;
  const collision = checkCollision(player.value, board.value, { x: 0, y: 1 });
  console.log('collision:', collision);
  if (!collision) {
    player.value = {
      ...player.value,
      pos: { ...player.value.pos, y: player.value.pos.y + 1 }
    };
    console.log('moved down, new y:', player.value.pos.y);
  } else {
    // 检查锁定后是否有一格在 y < 0
    const { tetromino, pos } = player.value;
    let gameOver = false;
    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardY = y + pos.y;
          if (boardY < 0) gameOver = true;
        }
      });
    });
    if (gameOver) {
      console.log('GAME OVER (dropPlayer lock)');
      board.value = createEmptyBoard();
      isGameOver.value = true;
      return;
    }
    updateBoard();
    sweepRows();
    resetPlayer();
  }
}

export function hardDropPlayer() {
  if (isGameOver.value) return;
  // 不断下落直到碰撞
  while (!checkCollision(player.value, board.value, { x: 0, y: 1 })) {
    player.value = {
      ...player.value,
      pos: { ...player.value.pos, y: player.value.pos.y + 1 }
    };
  }
  // 速降后直接锁定（不在这里判定GAME OVER）
  updateBoard();
  sweepRows();
  resetPlayer();
}

function updateBoard() {
  const { tetromino, pos } = player.value;
  shakeType.value = 'shake-soft'; // 锁死时轻微震动
  setTimeout(() => { shakeType.value = ''; }, 200);
  tetromino.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardX = x + pos.x;
        const boardY = y + pos.y;
        if (board.value[boardY] && board.value[boardY][boardX] === 0) {
          board.value[boardY][boardX] = value;
        }
      }
    });
  });
}

export function sweepRows() {
  let clearedRows = 0;
  let cleared = [];
  outer: for (let y = board.value.length - 1; y > 0; y -= 1) {
    for (let x = 0; x < board.value[y].length; x += 1) {
      if (board.value[y][x] === 0) {
        continue outer;
      }
    }
    cleared.push(y);
    const newRow = Array(board.value[0].length).fill(0);
    board.value.splice(y, 1);
    board.value.unshift(newRow);
    clearedRows += 1;
    y += 1;
  }
  if (clearedRows > 0) {
    shakeType.value = 'shake-hard'; // 消行时重震动
    dissolveRows.value = cleared;
    setTimeout(() => {
      shakeType.value = '';
      dissolveRows.value = [];
    }, 500);
    score.value += [40, 100, 300, 1200][clearedRows - 1] * (level.value + 1);
    lines.value += clearedRows;
    level.value = Math.floor(lines.value / 10);
  }
}

function rotate(matrix) {
  const rotatedMatrix = matrix.map((_, index) => matrix.map(col => col[index]));
  rotatedMatrix.forEach(row => row.reverse());
  return rotatedMatrix;
}

export function rotatePlayer() {
  if (isGameOver.value) return;
  const clonedPlayer = JSON.parse(JSON.stringify(player.value));
  clonedPlayer.tetromino.shape = rotate(clonedPlayer.tetromino.shape);

  // Check for collision at current position
  if (!checkCollision(clonedPlayer, board.value, { x: 0, y: 0 })) {
    player.value.tetromino.shape = clonedPlayer.tetromino.shape;
    return;
  }

  // Wall kick logic
  const originalPos = { ...clonedPlayer.pos };
  const kicks = [1, -1, 2, -2]; // Offsets to try

  for (const kick of kicks) {
    clonedPlayer.pos.x = originalPos.x + kick;
    if (!checkCollision(clonedPlayer, board.value, { x: 0, y: 0 })) {
      player.value.pos.x = clonedPlayer.pos.x;
      player.value.tetromino.shape = clonedPlayer.tetromino.shape;
      return;
    }
  }
} 