import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '首页',
      icon: '🏠',
      hideInMenu: true
    }
  },
  {
    path: '/image-detect',
    name: 'image-detect',
    component: () => import('../views/ImageDetectView.vue'),
    meta: {
      title: '人物唱歌',
      icon: '🎥'
    }
  },
  {
    path: '/voice-clone',
    name: 'voice-clone',
    component: () => import('../views/VoiceCloneView.vue'),
    meta: {
      title: '音频复刻',
      icon: '🎵'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
