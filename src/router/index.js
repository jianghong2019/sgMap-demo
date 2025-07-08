import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import sceneWork from '../views/sceneWork.vue'
import { } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: sceneWork,
    }
  ],
})

export default router
