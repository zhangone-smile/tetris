<template>
  <div class="stats">
    <div>
      <h3>分数</h3>
      <p>{{ score }}</p>
    </div>
    <div>
      <h3>行数</h3>
      <p>{{ lines }}</p>
    </div>
    <div>
      <h3>等级</h3>
      <p>{{ level }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  score: {
    type: Number,
    required: true,
  },
  lines: {
    type: Number,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
.stats {
  padding: 20px;
  border: 2px solid #333;
  border-radius: 10px;
  background-color: #f9f9f9;
  position: relative;
  z-index: 1;
}
.stats div {
  margin-bottom: 10px;
}
h3 {
  margin: 0;
  font-size: 1em;
}
p {
  margin: 0;
  font-size: 1.2em;
  font-weight: bold;
}
</style> 