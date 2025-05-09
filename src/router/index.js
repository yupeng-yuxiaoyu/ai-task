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
  },
  {
    path: '/text-to-speech',
    name: 'text-to-speech',
    component: () => import('../views/TextToSpeechView.vue'),
    meta: {
      title: '文本转语音TTS',
      icon: '🔊'
    }
  },
  {
    path: '/voice-clone-tts',
    name: 'voice-clone-tts',
    component: () => import('../views/VoiceCloneTTSView.vue'),
    meta: {
      title: '语音复刻转语音',
      icon: '🗣️'
    }
  },
  {
    path: '/sambert-tts',
    name: 'sambert-tts',
    component: () => import('../views/SambertTTS.vue'),
    meta: {
      title: 'Sambert文本转语音',
      icon: '🔊'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
