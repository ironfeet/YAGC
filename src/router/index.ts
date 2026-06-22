import { createRouter, createWebHashHistory } from 'vue-router';
import GlobalMenu from '../views/GlobalMenu.vue';
import GameSelectionMenu from '../views/GameSelectionMenu.vue';
import GameView from '../views/GameView.vue';
import SettingsView from '../views/SettingsView.vue';
import StatisticsView from '../views/StatisticsView.vue';

const router = createRouter({
  // Use Hash history for easier local NAS deployment without server config
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: GlobalMenu
    },
    {
      path: '/mita',
      name: 'MITA',
      component: GameSelectionMenu
    },
    {
      path: '/game/:id',
      name: 'Game',
      component: GameView
    },
    {
      path: '/statistics',
      name: 'Statistics',
      component: StatisticsView
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsView
    },
    {
      path: '/random-success',
      name: 'RandomSuccess',
      component: () => import('../views/RandomSuccessView.vue')
    }
  ]
});

export default router;

