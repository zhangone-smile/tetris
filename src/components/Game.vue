<template>
  <div class="game">
    <div class="operation-hint">
      <div><b>M</b> → 速降</div>
      <div><b>↑</b> → 翻转</div>
      <div><b>←</b> → 方块向左</div>
      <div><b>→</b> → 方块向右</div>
      <div><b>↓</b> → 连续下降</div>
    </div>
    <button class="back-btn" @click="goBack">返回</button>
    <h1 class="tetris-title">Tetris</h1>
    <div class="mode-title">{{ modeTitle }}</div>
    <div class="mode-switch">
      <button :class="{active: currentMode==='classic'}" @click="switchMode('classic')">经典模式</button>
      <button :class="{active: currentMode==='fastfire'}" @click="switchMode('fastfire')">急速快打</button>
    </div>
    <div class="game-area">
      <Board :board="gameBoard" :shakeType="shakeType" :dissolveRows="dissolveRows" @shakeEnd="onShakeEnd" />
      <aside>
        <Stats :score="score" :lines="lines" :level="level" />
        <NextPiece :piece="nextPiece" />
        <button class="start-btn" @click="handleStartGame">开始游戏</button>
        <div class="restart-tip">按R重新开始</div>
      </aside>
    </div>
    <GameOverOverlay v-if="showGameOver"
      @close="closeGameOver"
      :lines="currentMode==='fastfire' ? ['在这个快节奏的时代，我们不必永远行色匆匆，爱和生活可以再慢一些，即使错过了落日余晖，也还会有满天星辰'] : undefined"
      :bless="currentMode==='fastfire' ? '张芝毓，愿你永远从容与浪漫' : undefined"
    />
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
  board, player, movePlayer, dropPlayer, rotatePlayer, 
  score, lines, level, nextPiece, startGame, isGameOver, hardDropPlayer, 
  shakeType, dissolveRows, currentMode 
} from '../core/game';
import { useRouter } from 'vue-router';

let dropInterval;
let hardDropLock = false;
let justHardDropped = false;
let downInterval = null;
let leftInterval = null;
let rightInterval = null;
const showGameOver = ref(false);
const router = useRouter();

let isFastfirePause = false;
let fastfireTimer = null;

watch(
  () => player.value.tetromino,
  () => {
    if (currentMode.value === 'fastfire') {
      isFastfirePause = true;
      if (fastfireTimer) clearTimeout(fastfireTimer);
      fastfireTimer = setTimeout(() => {
        isFastfirePause = false;
        hardDropPlayer();
      }, 1500);
    }
  }
);

const props = defineProps({
  showFeedbackTip: {
    type: Boolean,
    default: false
  }
});

const modeTitle = computed(() => currentMode.value === 'fastfire' ? '急速快打' : '经典模式');

function switchMode(mode) {
  currentMode.value = mode;
  handleStartGame();
}

const handleStartGame = () => {
  startGame(currentMode.value);
  if (dropInterval) {
    clearInterval(dropInterval);
  }
  dropInterval = setInterval(() => {
    if (justHardDropped) {
      justHardDropped = false;
      return;
    }
    if (currentMode.value === 'fastfire') {
      if (isFastfirePause) return;
      return;
    } else {
      dropPlayer();
    }
  }, 1000);
};

const handleKeyPress = (event) => {
  // 阻止方向键和空格键的默认行为，防止页面滚动
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
    movePlayer(-1);
    if (!leftInterval) {
      leftInterval = setInterval(() => {
        movePlayer(-1);
      }, 60);
    }
  } else if (event.key === 'ArrowRight') {
    movePlayer(1);
    if (!rightInterval) {
      rightInterval = setInterval(() => {
        movePlayer(1);
      }, 60);
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
  if (event.key === 'ArrowLeft') {
    if (leftInterval) {
      clearInterval(leftInterval);
      leftInterval = null;
    }
  }
  if (event.key === 'ArrowRight') {
    if (rightInterval) {
      clearInterval(rightInterval);
      rightInterval = null;
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
  window.removeEventListener('keyup', handleKeyUp);
  clearInterval(dropInterval);
  if (downInterval) clearInterval(downInterval);
  if (leftInterval) clearInterval(leftInterval);
  if (rightInterval) clearInterval(rightInterval);
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

const onShakeEnd = () => {
  // 这里可做后续处理，目前shakeType和dissolveRows已自动清空
};

function onGameOver() {
  showGameOver.value = true;
}
function closeGameOver() {
  showGameOver.value = false;
  // 可在此重置游戏或返回主界面
}

watch(isGameOver, (val) => {
  if (val) showGameOver.value = true;
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
.operation-hint {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  font-size: 1.1em;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  background: rgba(30,40,60,0.85);
  border-radius: 10px;
  padding: 18px 28px 18px 18px;
  z-index: 10;
  box-shadow: 0 2px 12px #0004;
  letter-spacing: 2px;
  user-select: none;
  line-height: 2.1;
  min-width: 140px;
}
.operation-hint b {
  font-size: 1.2em;
  color: #FFD600;
  font-weight: bold;
  margin-right: 6px;
}
.mode-switch {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 12px;
}
.mode-switch button {
  background: rgba(30,40,60,0.85);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-size: 1.1em;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  cursor: pointer;
  letter-spacing: 2px;
  box-shadow: 0 2px 12px #0004;
  transition: background 0.18s, color 0.18s;
}
.mode-switch button.active, .mode-switch button:hover {
  background: #FFD600;
  color: #223366;
}
</style> 