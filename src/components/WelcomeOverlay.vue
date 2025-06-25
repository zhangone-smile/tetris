<template>
  <div class="overlay" v-if="stage !== 'hidden'">
    <div v-if="stage === 'question'" class="welcome-box">
      <div class="question" :style="{ fontFamily }">
        张芝毓和张壹的恋爱纪念日是
      </div>
      <div class="answer-row">
        <input v-model="year" maxlength="4" class="input" placeholder="____" />年
        <input v-model="month" maxlength="2" class="input" placeholder="__" />月
        <input v-model="day" maxlength="2" class="input" placeholder="__" />日
      </div>
      <button class="submit-btn" @click="checkAnswer">确定</button>
      <div v-if="error" class="error">回答错误请重新输入</div>
    </div>
    <transition name="fade">
      <div v-if="stage === 'welcome' || stage === 'fadeout'" class="big-welcome" :style="{ fontFamily }">
        送给最最最好的张芝毓
      </div>
    </transition>
    <transition name="fade">
      <div v-if="stage === 'wrong' || stage === 'wrongfade'" class="big-welcome" :style="{ fontFamily }">
        这是一个设计给我女朋友的Tetris网页，感谢你的使用，有任何修改意见欢迎反馈至 yzhangsp@gmail.com
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const emit = defineEmits(['finish']);
const fontFamily = 'FangSong, Noto Serif SC, SimSun, serif';
const year = ref('');
const month = ref('');
const day = ref('');
const error = ref(false);
const stage = ref('question');
function checkAnswer() {
  if (year.value === '2025' && month.value === '5' && day.value === '15') {
    error.value = false;
    stage.value = 'welcome';
    setTimeout(() => {
      stage.value = 'fadeout';
      setTimeout(() => {
        stage.value = 'hidden';
        emit('finish', false);
      }, 800);
    }, 2000);
  } else {
    error.value = false;
    stage.value = 'wrong';
    setTimeout(() => {
      stage.value = 'wrongfade';
      setTimeout(() => {
        stage.value = 'hidden';
        emit('finish', true);
      }, 800);
    }, 2000);
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  left: 0; top: 0; right: 0; bottom: 0;
  background: rgba(10, 16, 32, 0.92);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 0.4s;
  user-select: none;
}
.welcome-box {
  background: rgba(30,40,60,0.92);
  border-radius: 18px;
  padding: 40px 32px 32px 32px;
  box-shadow: 0 4px 32px #000a;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
}
.question {
  color: #fff;
  font-size: 1.5em;
  margin-bottom: 24px;
  letter-spacing: 2px;
  text-align: center;
}
.answer-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  font-family: FangSong, Noto Serif SC, SimSun, serif !important;
}
.answer-row span, .answer-row label, .answer-row {
  color: #fff !important;
  font-family: FangSong, Noto Serif SC, SimSun, serif !important;
}
.input {
  width: 48px;
  font-size: 1.2em;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #fff7;
  background: #222b44;
  color: #fff;
  text-align: center;
  outline: none;
}
.input:focus {
  border-color: #fff;
  background: #2a3355;
}
.submit-btn {
  margin-top: 8px;
  padding: 8px 32px;
  font-size: 1.1em;
  border-radius: 8px;
  border: none;
  background: #fff;
  color: #223366;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.submit-btn:hover {
  background: #ffd600;
  color: #222b44;
}
.error {
  color: #ff6b81;
  margin-top: 12px;
  font-size: 1em;
  letter-spacing: 1px;
}
.big-welcome {
  color: #fff;
  font-size: 2.6em;
  font-family: FangSong, Noto Serif SC, SimSun, serif;
  text-align: center;
  letter-spacing: 3px;
  text-shadow: 0 2px 16px #fff6;
  opacity: 0.98;
  font-weight: bold;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style> 