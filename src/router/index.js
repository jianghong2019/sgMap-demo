import { createRouter, createWebHistory } from 'vue-router'
import sceneWork from '../views/sceneWork.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: sceneWork,
    }
  ],
})

export default router
