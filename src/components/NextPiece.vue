<template>
  <div class="next-piece">
    <h3>下一个</h3>
    <div class="piece-board">
      <div v-for="(row, y) in piece.shape" :key="y" class="row">
        <div 
          v-for="(cell, x) in row" 
          :key="x" 
          class="cell" 
          :style="{ backgroundColor: cell ? piece.color : 'transparent' }"
        >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  piece: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.next-piece {
  padding: 20px;
  border: 2px solid #333;
  border-radius: 10px;
  background-color: #f9f9f9;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.piece-board {
  margin-top: 10px;
}
.row {
  display: flex;
}
.cell {
  width: 20px;
  height: 20px;
}
</style> 