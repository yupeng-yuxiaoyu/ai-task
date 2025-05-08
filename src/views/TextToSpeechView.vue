<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { showToast } from "vant";

const route = useRoute();
const text = ref("");
const loading = ref(false);
const error = ref(null);
const audioList = ref([]);
const currentAudio = ref("");

// 获取当前路由作为存储前缀
const storageKey = `${route.path}_audio_list`;

// 从localStorage加载音频列表
const loadAudioList = () => {
  const savedList = localStorage.getItem(storageKey);
  if (savedList) {
    audioList.value = JSON.parse(savedList);
  }
};

// 保存音频信息到列表
const saveAudioInfo = (audioInfo) => {
  audioList.value.push(audioInfo);
  localStorage.setItem(storageKey, JSON.stringify(audioList.value));
};

// 切换当前播放的音频
const switchAudio = (url) => {
  currentAudio.value = url;
};

// 页面加载时读取本地存储的音频列表
onMounted(() => {
  loadAudioList();
});

const handleSubmit = async () => {
  if (!text.value) {
    error.value = "请输入要转换的文本";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("http://localhost:3000/api/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.value,
      }),
    });

    if (!response.ok) {
      throw new Error("请求失败");
    }

    const data = await response.json();
    if (data.output?.audio) {
      saveAudioInfo({
        id: data.output.audio.id,
        url: data.output.audio.url,
      });
      currentAudio.value = data.output.audio.url;
      showToast("转换成功");
    }
  } catch (err) {
    error.value = "请求失败：" + err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="text-to-speech">
    <h1>文本转语音TTS</h1>

    <div class="form">
      <div class="form-item">
        <label>输入文本：</label>
        <textarea
          v-model="text"
          placeholder="请输入要转换的文本"
          rows="4"
        ></textarea>
      </div>

      <button @click="handleSubmit" :disabled="loading">
        {{ loading ? "转换中..." : "转换" }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- 音频播放器 -->
    <div v-if="currentAudio" class="audio-player">
      <audio :src="currentAudio" controls></audio>
    </div>

    <!-- 音频列表 -->
    <div v-if="audioList.length > 0" class="audio-list">
      <h2>历史记录</h2>
      <ul>
        <li
          v-for="audio in audioList"
          :key="audio.id"
          @click="switchAudio(audio.url)"
          :class="{ active: currentAudio === audio.url }"
        >
          <span class="audio-id">{{ audio.id }}</span>
          <span class="play-icon">▶</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.text-to-speech {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form {
  margin: 20px 0;
}

.form-item {
  margin-bottom: 15px;
}

.form-item label {
  display: block;
  margin-bottom: 5px;
}

.form-item textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin: 10px 0;
}

.audio-player {
  margin: 20px 0;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.audio-player audio {
  width: 100%;
}

.audio-list {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.audio-list h2 {
  margin-bottom: 15px;
  color: #333;
}

.audio-list ul {
  list-style: none;
  padding: 0;
}

.audio-list li {
  padding: 10px;
  margin: 5px 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.audio-list li:hover {
  background-color: #f0f0f0;
}

.audio-list li.active {
  background-color: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.audio-id {
  flex: 1;
  margin-right: 10px;
  word-break: break-all;
}

.play-icon {
  color: #4caf50;
}
</style>
