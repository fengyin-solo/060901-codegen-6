import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import RoomPage from '@/pages/RoomPage.vue'
import GamePage from '@/pages/GamePage.vue'
import ReportPage from '@/pages/ReportPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/room/:id',
      name: 'room',
      component: RoomPage
    },
    {
      path: '/room/:id/game',
      name: 'game',
      component: GamePage
    },
    {
      path: '/room/:id/report',
      name: 'report',
      component: ReportPage
    }
  ]
})

export default router
