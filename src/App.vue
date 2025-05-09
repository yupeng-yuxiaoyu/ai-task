<script setup>
import { onMounted, onUnmounted } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { ref } from "vue";
import { Popup } from "vant";
import "vant/lib/index.css";

const showPopup = ref(false);

const handleNavClick = () => {
  showPopup.value = false;
};

const isSticky = ref(false);

// 添加滚动监听
onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

const handleScroll = () => {
  isSticky.value = window.scrollY > 0;
};
</script>

<template>
  <header :class="{ sticky: isSticky }">
    <div class="wrapper">
      <div class="nav-icon" @click="showPopup = true">
        <i class="menu-icon"></i>
      </div>
    </div>
  </header>

  <Popup
    v-model:show="showPopup"
    position="left"
    :style="{ width: '60%', height: '100%' }"
  >
    <div class="popup-content">
      <nav>
        <RouterLink to="/" @click="handleNavClick">首页</RouterLink>
        <RouterLink to="/image-detect" @click="handleNavClick"
          >人物唱歌</RouterLink
        >
        <RouterLink to="/voice-clone" @click="handleNavClick"
          >音频复刻</RouterLink
        >
        <RouterLink to="/text-to-speech" @click="handleNavClick">
          文本转语音TTS</RouterLink
        >
        <RouterLink to="/voice-clone-tts" @click="handleNavClick">
          语音复刻转语音</RouterLink
        >
        <RouterLink to="/sambert-tts" @click="handleNavClick">
          Sambert文本转语音</RouterLink
        >
      </nav>
    </div>
  </Popup>

  <div class="content-container">
    <RouterView />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
  padding: 1rem;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

header.sticky {
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.wrapper {
  display: flex;
  align-items: center;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.menu-icon {
  position: relative;
  width: 20px;
  height: 2px;
  background-color: #333;
}

.menu-icon::before,
.menu-icon::after {
  content: "";
  position: absolute;
  width: 20px;
  height: 2px;
  background-color: #333;
  transition: all 0.3s ease;
}

.menu-icon::before {
  top: -6px;
}

.menu-icon::after {
  top: 6px;
}

.popup-content {
  padding: 20px;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

nav a {
  display: block;
  padding: 10px;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
}

nav a:hover {
  background-color: #f5f5f5;
}

nav a.router-link-active {
  color: #4caf50;
  background-color: #e8f5e9;
}
</style>
