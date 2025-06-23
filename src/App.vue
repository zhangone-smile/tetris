<!-- Tetris App -->
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import WelcomeOverlay from './components/WelcomeOverlay.vue';

let animationId;
let resizeHandler;

const showWelcome = ref(true);
const router = useRouter();
function handleWelcomeFinish() {
  showWelcome.value = false;
  setTimeout(() => {
    router.push('/mode');
  }, 400);
}

onMounted(() => {
  const canvas = document.getElementById('star-bg');
  const ctx = canvas.getContext('2d');
  let w = window.innerWidth;
  let h = window.innerHeight;
  let stars = [];
  const STAR_NUM = 180;
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }
  resize();
  resizeHandler = resize;
  window.addEventListener('resize', resize);
  for (let i = 0; i < STAR_NUM; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.5,
      alpha: Math.random() * 0.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.08,
      dy: (Math.random() - 0.5) * 0.08,
    });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let s of stars) {
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
      ctx.fillStyle = '#b3e5fc';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
      s.x += s.dx;
      s.y += s.dy;
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;
    }
    animationId = requestAnimationFrame(draw);
  }
  draw();
});

onUnmounted(() => {
  cancelAnimationFrame(animationId);
  window.removeEventListener('resize', resizeHandler);
});
</script>

<template>
  <div class="app-bg">
    <canvas id="star-bg" class="star-bg"></canvas>
    <WelcomeOverlay v-if="showWelcome" @finish="handleWelcomeFinish" />
    <transition name="fade">
      <div v-if="!showWelcome" key="main-content">
        <transition name="fade" appear><router-view style="transition-delay:0.2s"/></transition>
      </div>
    </transition>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.app-bg {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: FangSong, Noto Serif SC, SimSun, serif !important;
}
.star-bg {
  position: fixed;
  left: 0; top: 0; width: 100vw; height: 100vh;
  z-index: 0;
  pointer-events: none;
  background: #050d1f;
}
.blessing {
  font-family: FangSong, Noto Serif SC, SimSun, serif !important;
  font-size: 2.6em;
  color: #FFD600;
  text-align: center;
  margin-top: 32px;
  margin-bottom: 12px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px #fff7, 0 1px 0 #fff;
}
.app-nav { display: none; }
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
