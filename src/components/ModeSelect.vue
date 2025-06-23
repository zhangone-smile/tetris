<template>
  <div class="mode-select-bg">
    <button class="mode-btn" @click="selectMode('classic')">经典模式</button>
    <button class="mode-btn" @click="selectMode('blind')">盲打进阶</button>
    <button class="mode-btn" @click="selectMode('superblind')">超级盲打</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
function selectMode(mode) {
  if (mode === 'classic') {
    router.push('/');
  } else if (mode === 'blind') {
    router.push('/blind');
  } else if (mode === 'superblind') {
    router.push('/superblind');
  }
}
</script>

<style scoped>
.mode-select-bg {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  position: relative;
  z-index: 1;
}
.mode-btn {
  background: transparent;
  border: 2px solid #fff7;
  color: #fff;
  font-size: 2.1em;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  padding: 18px 64px;
  border-radius: 18px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s;
  box-shadow: 0 2px 16px #fff2;
  letter-spacing: 8px;
  outline: none;
}
.mode-btn:hover {
  background: rgba(255,255,255,0.08);
  color: #ffd600;
  border-color: #ffd600;
  box-shadow: 0 4px 32px #ffd60033;
}
</style> 