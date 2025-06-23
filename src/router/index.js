import { createRouter, createWebHistory } from 'vue-router';
import Game from '../components/Game.vue';
import ModeSelect from '../components/ModeSelect.vue';
import BlindGame from '../components/BlindGame.vue';
import SuperBlindGame from '../components/SuperBlindGame.vue';

const routes = [
  { path: '/', name: 'Home', component: Game },
  { path: '/mode', name: 'ModeSelect', component: ModeSelect },
  { path: '/blind', name: 'BlindGame', component: BlindGame },
  { path: '/superblind', name: 'SuperBlindGame', component: SuperBlindGame },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; 