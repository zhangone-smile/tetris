<template>
  <div class="game">
    <button class="back-btn" @click="goBack">返回</button>
    <h1 class="tetris-title">Tetris</h1>
    <div class="mode-title">盲打模式</div>
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
      :lines="['船只停在船坞中会非常安全，但那并不是造船的意义']"
      bless="张芝毓，我喜欢你挑战自我的样子"
    />
    <div v-if="showFeedbackTip" class="feedback-tip">反馈至yzhangsp@gmail.com</div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Board from './Board.vue';
import Stats from './Stats.vue';
import NextPiece from './NextPiece.vue';
import GameOverOverlay from './GameOverOverlay.vue';
import { 
  board, player, movePlayer, dropPlayer, rotatePlayer, 
  score, lines, level, nextPiece, startGame, isGameOver, hardDropPlayer, 
  shakeType, dissolveRows 
} from '../core/game';

const props = defineProps({
  showFeedbackTip: {
    type: Boolean,
    default: false
  }
});

let dropInterval;
let hardDropLock = false;
let justHardDropped = false;
const showGameOver = ref(false);
const router = useRouter();

const hideActivePiece = ref(false);
const isPaused = ref(false);
let showTimer = null;
let downInterval = null;

const handleStartGame = () => {
  startGame('blind');
  showActivePieceForAWhile();
  if (dropInterval) {
    clearInterval(dropInterval);
  }
  dropInterval = setInterval(() => {
    if (justHardDropped) {
      justHardDropped = false;
      return;
    }
    if (!isPaused.value) {
      dropPlayer();
    }
  }, 1000);
};

const handleKeyPress = (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
  if (event.code === 'KeyM') {
    if (!hardDropLock) {
      hardDropPlayer();
      hardDropLock = true;
      justHardDropped = true;
    }
    return;
  }
  if (event.code === 'KeyR') {
    handleStartGame();
    return;
  }
  if (event.repeat) return;
  if (event.key === 'ArrowLeft') {
    if (isAtLeftEdge()) {
      showActivePieceForEdge();
    } else {
      shakeType.value = 'shake-left';
      setTimeout(() => { shakeType.value = ''; }, 180);
      movePlayer(-1);
    }
  } else if (event.key === 'ArrowRight') {
    if (isAtRightEdge()) {
      showActivePieceForEdge();
    } else {
      shakeType.value = 'shake-right';
      setTimeout(() => { shakeType.value = ''; }, 180);
      movePlayer(1);
    }
  } else if (event.key === 'ArrowDown') {
    dropPlayer();
    if (!downInterval) {
      downInterval = setInterval(() => {
        dropPlayer();
      }, 60);
    }
  } else if (event.key === 'ArrowUp') {
    rotatePlayer();
  }
};

const handleKeyUp = (event) => {
  if (event.code === 'KeyM') {
    hardDropLock = false;
  }
  if (event.key === 'ArrowDown') {
    if (downInterval) {
      clearInterval(downInterval);
      downInterval = null;
    }
  }
};

function showActivePieceForAWhile() {
  hideActivePiece.value = false;
  if (showTimer) clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    hideActivePiece.value = true;
  }, 1000);
}

function isAtLeftEdge() {
  const { tetromino, pos } = player.value;
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = 0; x < tetromino.shape[y].length; x++) {
      if (tetromino.shape[y][x] !== 0) {
        if (pos.x + x === 0) return true;
      }
    }
  }
  return false;
}
function isAtRightEdge() {
  const { tetromino, pos } = player.value;
  for (let y = 0; y < tetromino.shape.length; y++) {
    for (let x = tetromino.shape[y].length - 1; x >= 0; x--) {
      if (tetromino.shape[y][x] !== 0) {
        if (pos.x + x === 9) return true;
      }
    }
  }
  return false;
}
function showActivePieceForEdge() {
  hideActivePiece.value = false;
  if (showTimer) clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    hideActivePiece.value = true;
  }, 500);
}

watch(player, (newVal, oldVal) => {
  // 新方块生成时显示1秒
  if (oldVal && (newVal.tetromino !== oldVal.tetromino)) {
    showActivePieceForAWhile();
  }
});

watch(isGameOver, (val) => {
  if (val) showGameOver.value = true;
});

function onShakeEnd() {
  // 消除行特效已自动处理
}

function onGameOver() {
  showGameOver.value = true;
}
function closeGameOver() {
  showGameOver.value = false;
}

function handleViewDown() {
  isPaused.value = true;
  hideActivePiece.value = false;
}
function handleViewUp() {
  isPaused.value = false;
  hideActivePiece.value = true;
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('keyup', handleKeyUp);
  // 进入页面自动初始化为盲打模式
  handleStartGame();
  // 游戏开始时显示1秒
  showActivePieceForAWhile();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  window.removeEventListener('keyup', handleKeyUp);
  clearInterval(dropInterval);
  if (downInterval) clearInterval(downInterval);
  if (showTimer) clearTimeout(showTimer);
});

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
  return newBoard;
});

function goBack() {
  router.push('/mode');
}
</script>

<style scoped>
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
.feedback-tip {
  position: fixed;
  right: 18px;
  bottom: 12px;
  color: #FFD600;
  font-size: 0.98em;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  z-index: 10000;
  pointer-events: none;
}
</style> 