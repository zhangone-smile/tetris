<template>
  <div class="game">
    <button class="back-btn" @click="goBack">返回</button>
    <h1 class="tetris-title">Tetris</h1>
    <div class="mode-title">超级盲打</div>
    <div class="game-area">
      <Board :board="gameBoard" :shakeType="shakeType" :dissolveRows="dissolveRows" :hideActivePiece="hideActivePiece" @shakeEnd="onShakeEnd" />
      <aside>
        <Stats :score="score" :lines="lines" :level="level" />
        <NextPiece :piece="nextPiece" />
        <button class="start-btn" @click="handleStartGame">开始游戏</button>
        <div class="restart-tip">按R重新开始</div>
        <button class="view-btn" @mousedown="handleViewDown" @mouseup="handleViewUp" @mouseleave="handleViewUp">查看</button>
      </aside>
    </div>
    <GameOverOverlay v-if="showGameOver" 
      @close="closeGameOver" 
      :lines="['我们渴望挑战高山，迎接更难的挑战，但是有的时候，简单的过程，更是幸福的映射']"
      bless="张芝毓，我希望你永远简单，美好，幸福"
    />
  </div>
</template>

<script setup>
console.log('SuperBlindGame.vue 文件已加载'); // 调试输出
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Board from './Board.vue';
import Stats from './Stats.vue';
import NextPiece from './NextPiece.vue';
import GameOverOverlay from './GameOverOverlay.vue';
import {
  board, player, movePlayer, dropPlayer, rotatePlayer,
  score, lines, level, nextPiece, startGame, isGameOver, hardDropPlayer,
  shakeType, dissolveRows, superBlindConfig, currentMode, createEmptyBoard, resetPlayer, checkCollision
} from '../core/game';
import { randomTetromino } from '../core/tetrominoes';
import { sweepRows } from '../core/game';

let dropInterval = null;
let showTimer = null;
let lockShowTimer = null;
const showGameOver = ref(false);
const router = useRouter();
const hideActivePiece = ref(false);
const isPaused = ref(false);
let hardDropLock = false;
const lockedMask = ref([]); // 当前刚锁定的格子
const disappearSet = ref(new Set()); // 永久消失的格子，存储为 'x,y' 字符串

function clearAllTimers() {
  if (dropInterval) clearInterval(dropInterval);
  if (showTimer) clearTimeout(showTimer);
  if (lockShowTimer) clearTimeout(lockShowTimer);
}

function handleStartGame() {
  clearAllTimers();
  hideActivePiece.value = false;
  isPaused.value = false;
  showGameOver.value = false;
  startGame('superblind');
  showActivePieceForAWhile();
  // 超级盲打：下落速度提升2倍（间隔减半）
  dropInterval = setInterval(() => {
    if (!isPaused.value && !isGameOver.value) {
      dropPlayerWithLockShow();
    }
  }, Math.max(50, (1000 - level.value * 50) / 2));
}

function dropPlayerWithLockShow() {
  // 先判断是否会锁定
  const beforeY = player.value.pos.y;
  dropPlayer();
  // 如果下落后y没变，说明锁定了，短暂显示后隐藏
  if (player.value.pos.y === beforeY) {
    showActivePieceOnLock();
  }
}

function handleKeyPress(event) {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
  if (event.code === 'KeyR') {
    handleStartGame();
    return;
  }
  if (event.code === 'KeyM') {
    if (!hardDropLock) {
      hardDropPlayer();
      hardDropLock = true;
      justHardDropped = true;
    }
    return;
  }
  if (event.repeat) return;
  if (event.key === 'ArrowLeft') {
    shakeType.value = 'shake-left';
    setTimeout(() => { shakeType.value = ''; }, 180);
    movePlayer(-1);
  } else if (event.key === 'ArrowRight') {
    shakeType.value = 'shake-right';
    setTimeout(() => { shakeType.value = ''; }, 180);
    movePlayer(1);
  } else if (event.key === 'ArrowDown') {
    dropPlayerWithLockShow();
  } else if (event.key === 'ArrowUp') {
    rotatePlayer();
  }
}

function handleKeyUp(event) {
  if (event.code === 'KeyM') {
    hardDropLock = false;
  }
}

function showActivePieceForAWhile() {
  hideActivePiece.value = false;
  if (showTimer) clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    if (!isPaused.value) hideActivePiece.value = true;
  }, superBlindConfig.value.showPieceTime);
}

function showActivePieceOnLock() {
  hideActivePiece.value = false;
  if (lockShowTimer) clearTimeout(lockShowTimer);
  lockShowTimer = setTimeout(() => {
    if (!isPaused.value) hideActivePiece.value = true;
  }, superBlindConfig.value.showLockTime);
}

watch(player, (newVal, oldVal) => {
  // 新方块生成时短暂显示
  if (oldVal && (newVal.tetromino !== oldVal.tetromino)) {
    showActivePieceForAWhile();
  }
});

watch(isGameOver, (val) => {
  if (val) showGameOver.value = true;
});

function handleViewDown() {
  isPaused.value = true;
  hideActivePiece.value = false;
  if (showTimer) clearTimeout(showTimer);
  if (lockShowTimer) clearTimeout(lockShowTimer);
}
function handleViewUp() {
  isPaused.value = false;
  hideActivePiece.value = true;
}

function onShakeEnd() {}
function closeGameOver() { showGameOver.value = false; }

const gameBoard = computed(() => {
  const newBoard = board.value.map(row => [...row]);
  const { tetromino, pos } = player.value;
  if (!hideActivePiece.value) {
    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const boardX = x + pos.x;
          const boardY = y + pos.y;
          if (newBoard[boardY] && newBoard[boardY][boardX] !== undefined) {
            newBoard[boardY][boardX] = value;
          }
        }
      });
    });
  }
  // 移除lockedMask和disappearSet里的格子
  lockedMask.value.forEach(({ x, y }) => {
    if (newBoard[y] && newBoard[y][x] !== undefined) {
      newBoard[y][x] = 0;
    }
  });
  disappearSet.value.forEach(key => {
    const [x, y] = key.split(',').map(Number);
    if (newBoard[y] && newBoard[y][x] !== undefined) {
      newBoard[y][x] = 0;
    }
  });
  return newBoard;
});

function goBack() {
  clearAllTimers();
  router.push('/mode');
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  window.removeEventListener('keyup', handleKeyUp);
  clearAllTimers();
});
</script>

<style scoped>
/* 样式同盲打模式，可直接复用 */
.game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}
.game-area {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}
aside {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mode-title {
  font-size: 2.8em;
  color: #fff;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  text-align: center;
  margin-bottom: 48px;
  margin-top: 64px;
  letter-spacing: 6px;
  font-weight: bold;
  text-shadow: 0 2px 16px #fff6;
}
.tetris-title {
  font-size: 2.2em;
  color: #fff;
  font-family: 'Noto Serif SC', FangSong, SimSun, serif;
  text-align: center;
  margin-bottom: 0.5em;
  margin-top: 32px;
  letter-spacing: 8px;
  font-weight: bold;
  text-shadow: 0 2px 16px #fff6;
}
.start-btn {
  margin-top: 24px;
  width: 100%;
  min-width: 120px;
  min-height: 64px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2.1em;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  font-weight: bold;
  letter-spacing: 8px;
  cursor: pointer;
  outline: none;
  box-shadow: none;
  transition: color 0.18s, text-shadow 0.18s;
  text-align: center;
  text-shadow: 0 2px 16px #fff7, 0 1px 0 #fff;
}
.start-btn:hover {
  color: #ffd600;
  text-shadow: 0 4px 32px #ffd60099, 0 2px 8px #fff7;
}
.restart-tip {
  margin-top: 8px;
  font-size: 1em;
  color: #fff9;
  text-align: center;
  letter-spacing: 2px;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  user-select: none;
}
.back-btn {
  position: absolute;
  left: 32px;
  top: 32px;
  background: rgba(30,40,60,0.85);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 28px;
  font-size: 1.1em;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  cursor: pointer;
  letter-spacing: 4px;
  box-shadow: 0 2px 12px #0004;
  transition: background 0.18s, color 0.18s;
  z-index: 2;
}
.back-btn:hover {
  background: #ffd600;
  color: #223366;
}
.view-btn {
  margin-top: 18px;
  width: 100%;
  min-width: 120px;
  min-height: 48px;
  background: rgba(255,255,255,0.08);
  border: 2px solid #ffd600;
  color: #ffd600;
  font-size: 1.2em;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  font-weight: bold;
  letter-spacing: 6px;
  border-radius: 12px;
  cursor: pointer;
  outline: none;
  box-shadow: 0 2px 12px #ffd60022;
  transition: background 0.18s, color 0.18s, border 0.18s;
  text-align: center;
}
.view-btn:active {
  background: #ffd600;
  color: #223366;
  border-color: #ffd600;
}
</style> 