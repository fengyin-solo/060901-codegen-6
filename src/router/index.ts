import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import RoomPage from '@/pages/RoomPage.vue'
import GamePage from '@/pages/GamePage.vue'

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
    }
  ]
})

export default router
