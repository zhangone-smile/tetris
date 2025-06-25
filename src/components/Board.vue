<template>
  <div :class="['board-bg', shakeType]" @animationend="onShakeEnd" style="position:relative;">
    <div class="board">
      <div v-for="(row, y) in board" :key="y" class="row">
        <div 
          v-for="(cell, x) in row" 
          :key="x" 
          class="cell" 
          :class="{ 'cell-dissolve': dissolveRows.includes(y) && cell !== 0 }"
          :style="getCellStyle(cell)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TETROMINOES } from '../core/tetrominoes';
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  board: {
    type: Array,
    required: true,
  },
  shakeType: {
    type: String,
    default: '',
  },
  dissolveRows: {
    type: Array,
    default: () => [],
  },
  hideActivePiece: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['shakeEnd']);

const onShakeEnd = (e) => {
  if (e.animationName === 'shake-soft' || e.animationName === 'shake-hard') {
    emit('shakeEnd');
  }
};

const getCellStyle = (cell) => {
  if (!TETROMINOES[cell]) {
    return {
      background: 'rgba(16,28,58,0.7)',
      border: '1px solid #223366',
      boxShadow: 'inset 0 0 8px #223366',
      borderRadius: '8px',
    };
  }
  return {
    background: `linear-gradient(145deg, ${TETROMINOES[cell].color} 60%, #fff 100%)`,
    border: `2px solid ${TETROMINOES[cell].color}`,
    boxShadow: `0 0 8px 2px ${TETROMINOES[cell].color}99, 0 2px 8px #fff4`,
    borderRadius: '8px',
    position: 'relative',
    overflow: 'visible',
  };
};

// 获取某一行的主色
function getRowMainColor(y) {
  const row = props.board[y] || [];
  for (let cell of row) {
    if (TETROMINOES[cell]) return TETROMINOES[cell].color;
  }
  return '#fff';
}
</script>

<style scoped>
@keyframes shake-soft {
  0% { transform: translate(0, 0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(2px, -2px); }
  60% { transform: translate(-2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0, 0); }
}
@keyframes shake-hard {
  0% { transform: translate(0, 0); }
  10% { transform: translate(-8px, 8px); }
  20% { transform: translate(8px, -8px); }
  30% { transform: translate(-8px, 8px); }
  40% { transform: translate(8px, -8px); }
  100% { transform: translate(0, 0); }
}
@keyframes shake-left {
  0% { transform: translate(0, 0); }
  30% { transform: translate(-6px, 0); }
  60% { transform: translate(4px, 0); }
  100% { transform: translate(0, 0); }
}
@keyframes shake-right {
  0% { transform: translate(0, 0); }
  30% { transform: translate(6px, 0); }
  60% { transform: translate(-4px, 0); }
  100% { transform: translate(0, 0); }
}
.board-bg {
  background: #101c3a;
  padding: 24px;
  border-radius: 18px;
  box-shadow: 0 4px 32px #000a;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: box-shadow 0.2s;
  position: relative;
  overflow: visible;
}
.board-bg.shake-soft {
  animation: shake-soft 0.18s;
}
.board-bg.shake-hard {
  animation: shake-hard 0.38s;
}
.board-bg.shake-left {
  animation: shake-left 0.11s;
}
.board-bg.shake-right {
  animation: shake-right 0.11s;
}
.board {
  display: inline-block;
  background: repeating-linear-gradient(
    to right,
    #223366 0 1px,
    transparent 1px 30px
  ),
  repeating-linear-gradient(
    to bottom,
    #223366 0 1px,
    transparent 1px 30px
  );
  border-radius: 12px;
  box-shadow: 0 0 24px #0008;
  padding: 6px;
  position: relative;
  z-index: 1;
}
.row {
  display: flex;
  /* position: relative; */
}
.cell {
  width: 30px;
  height: 30px;
  margin: 1px;
  transition: background 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: visible;
}
.cell-dissolve {
  z-index: 2;
}
</style> 