import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import sceneWork from '../views/sceneWork.vue'
import dragPage from '../views/dragPage.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: sceneWork,
    },
    {
      path: '/drag',
      name: 'drag',
      component: dragPage,
    },
  ],
})

export default router
