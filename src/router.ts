import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import AppShell from './AppShell.vue';
import { gameRouteDefinitions } from './game/gameRoutes';

const gameRoutes: RouteRecordRaw[] = gameRouteDefinitions.map(({ path, name, view }) => ({
  path,
  name,
  component: AppShell,
  meta: { gameView: view },
  ...(view === 'market' ? { alias: '/game/practice/market' } : {}),
}));

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: AppShell },
    ...gameRoutes,
    { path: '/summary', name: 'summary', component: AppShell },
    { path: '/result', name: 'result', component: AppShell },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});