<template>
  <div class="game">
    <button class="back-btn" @click="goBack">返回</button>
    <h1 class="tetris-title">Tetris</h1>
    <div class="mode-title">颠倒乾坤</div>
    <div class="game-area">
      <Board :board="gameBoard" :shakeType="shakeType" :dissolveRows="dissolveRows" @shakeEnd="onShakeEnd" />
      <aside>
        <Stats :score="score" :lines="lines" :level="level" />
        <NextPiece :piece="nextPiece" />
        <button class="start-btn" @click="handleStartGame">开始游戏</button>
        <div class="restart-tip">按R重新开始</div>
      </aside>
    </div>
    <GameOverOverlay v-if="showGameOver" :lines="invertLines" :bless="invertBless" @close="closeGameOver" />
    <div v-if="showFeedbackTip" class="feedback-tip">反馈至yzhangsp@gmail.com</div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import Board from './Board.vue';
import Stats from './Stats.vue';
import NextPiece from './NextPiece.vue';
import GameOverOverlay from './GameOverOverlay.vue';
import { 
  board, player, movePlayer, score, lines, level, nextPiece, startGame, isGameOver, shakeType, dissolveRows, upPlayer, hardUpPlayer, rotatePlayer
} from '../core/game';
import { useRouter } from 'vue-router';

let dropInterval;
const showGameOver = ref(false);
const router = useRouter();

const props = defineProps({
  showFeedbackTip: {
    type: Boolean,
    default: false
  }
});

const invertLines = [
  '颠倒的乾坤中，也存在着永恒，倒置的视角下，游戏的逻辑并没有变化。',
  '生活中我们可能会遭遇一百次颠覆的故事，但也一定有一个不变的力量支撑着我们向前'
];
const invertBless = '张芝毓，你要坚定而赤诚';

const handleStartGame = () => {
  startGame('invert');
  if (dropInterval) {
    clearInterval(dropInterval);
  }
  dropInterval = setInterval(() => {
    upPlayer();
  }, 1000);
};

const handleKeyPress = (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
  if (event.code === 'KeyM') {
    hardUpPlayer();
    return;
  }
  if (event.code === 'KeyR') {
    handleStartGame();
    return;
  }
  if (event.repeat) return;
  if (event.key === 'ArrowLeft') {
    movePlayer(-1);
  } else if (event.key === 'ArrowRight') {
    movePlayer(1);
  } else if (event.key === 'ArrowDown') {
    upPlayer();
  } else if (event.key === 'ArrowUp') {
    rotatePlayer();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  clearInterval(dropInterval);
});

const gameBoard = computed(() => {
  const newBoard = board.value.map(row => [...row]);
  const { tetromino, pos } = player.value;
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
  return newBoard;
});

const onShakeEnd = () => {};
function closeGameOver() { showGameOver.value = false; }
function goBack() { router.push('/mode'); }

watch(isGameOver, (val) => {
  if (val) showGameOver.value = true;
});
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