import { createRouter, createWebHashHistory } from 'vue-router';
import AppShell from './AppShell.vue';

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: AppShell },
    { path: '/ranking', name: 'ranking', component: AppShell },
    { path: '/game/practice', name: 'practice-game', component: AppShell },
    { path: '/game/ranking', name: 'ranking-game', component: AppShell },
    { path: '/summary', name: 'summary', component: AppShell },
    { path: '/result', name: 'result', component: AppShell },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});
