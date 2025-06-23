<template>
  <div class="overlay" @click="handleClose">
    <transition-group name="fade" tag="div" class="lines">
      <div
        v-for="(line, idx) in visibleLines"
        :key="'line-'+idx"
        class="line"
        :style="{ fontFamily: fontFamily }"
      >
        {{ line }}
      </div>
    </transition-group>
    <transition name="fade">
      <div v-if="showBless" class="bless" :style="{ fontFamily: fontFamily }">
        {{ props.bless }}
      </div>
    </transition>
    <div class="tip">鼠标点击任何地方关闭</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  lines: {
    type: Array,
    default: () => [
      '人生很像俄罗斯方块，不用纠结于把每一个缝隙都填满，',
      '有一个东西放错了，不用纠结，',
      '只要不乱了阵脚，终有一日那些没填满的缝隙都会过去的。',
      '俄罗斯方块的乐趣，不止在堆得整齐，',
      '更在游刃有余',
    ]
  },
  bless: {
    type: String,
    default: '张芝毓，你要好好吃饭，天天开心'
  }
});

const emit = defineEmits(['close']);

const fontFamily = 'FangSong, Noto Serif SC, SimSun, serif';

const visibleLines = ref([]);
const showBless = ref(false);
let finished = false;

function handleClose() {
  if (!showBless.value) return; // 只有祝福语出现后才可关闭
  emit('close');
}

onMounted(async () => {
  // 依次浮现每一行
  for (let i = 0; i < props.lines.length; i++) {
    visibleLines.value.push(props.lines[i]);
    await new Promise(r => setTimeout(r, 1000));
  }
  // 全部显示后，保持2秒
  await new Promise(r => setTimeout(r, 2000));
  // 整体淡出
  visibleLines.value = [];
  await new Promise(r => setTimeout(r, 800));
  // 祝福语浮现
  showBless.value = true;
});
</script>

<style scoped>
.overlay {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(10, 16, 32, 0.88);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 0.4s;
  user-select: none;
}
.lines {
  margin-bottom: 48px;
  text-align: center;
}
.line {
  color: #fff;
  font-size: 1.3rem;
  margin: 0.5em 0;
  letter-spacing: 1px;
  opacity: 0.95;
  transition: opacity 0.5s;
}
.bless {
  color: #fff;
  font-size: 2.1rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 32px;
  letter-spacing: 2px;
  text-shadow: 0 2px 16px #fff6;
  opacity: 0.98;
}
.tip {
  position: absolute;
  bottom: 36px;
  left: 0; right: 0;
  text-align: center;
  color: #fff9;
  font-size: 0.95rem;
  letter-spacing: 1px;
  font-family: inherit;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 