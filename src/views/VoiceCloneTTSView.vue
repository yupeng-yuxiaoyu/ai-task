<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { showToast } from "vant";

const text = ref("");
const voiceId = ref("");
const loading = ref(false);
const error = ref(null);
const audioUrl = ref("");
const ws = ref(null);

// 连接WebSocket
const connectWebSocket = () => {
  ws.value = new WebSocket("ws://localhost:3000/ws/tts");

  ws.value.onopen = () => {
    console.log("WebSocket连接已建立");
  };

  // 修改WebSocket消息处理
  ws.value.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "audio") {
      // 收到音频URL
      audioUrl.value = message.url;
      // 保存到本地存储
      saveAudioInfo({
        url: message.url,
      });
      currentAudio.value = message.url;
      loading.value = false;
      showToast("转换完成");
    } else if (message.type === "error") {
      error.value = message.message;
      loading.value = false;
    }
  };

  ws.value.onclose = () => {
    console.log("WebSocket连接已关闭");
  };

  ws.value.onerror = (error) => {
    console.error("WebSocket错误:", error);
    error.value = "WebSocket连接错误";
    loading.value = false;
  };
};

// 发送转换请求
const handleSubmit = () => {
  if (!text.value || !voiceId.value) {
    error.value = "请输入文本和语音ID";
    return;
  }

  if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
    error.value = "WebSocket未连接";
    return;
  }

  loading.value = true;
  error.value = null;

  ws.value.send(
    JSON.stringify({
      text: text.value,
      voiceId: voiceId.value,
    })
  );
};

onMounted(() => {
  connectWebSocket();
});

onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
  }
});

const audioList = ref([]);
const currentAudio = ref("");

// 获取当前路由作为存储前缀
const storageKey = "voice_clone_tts_audio_list";

// 从localStorage加载音频列表
const loadAudioList = () => {
  const savedList = localStorage.getItem(storageKey);
  if (savedList) {
    audioList.value = JSON.parse(savedList);
  }
};

// 保存音频信息到列表
const saveAudioInfo = (audioInfo) => {
  // 从url中提取id
  const urlParts = audioInfo.url.split("/");
  const fileName = urlParts[urlParts.length - 1];
  const id = fileName.split(".")[0];

  audioList.value.push({
    id: id,
    url: audioInfo.url,
    text: text.value,
    voiceId: voiceId.value,
    timestamp: new Date().toLocaleString(),
  });
  localStorage.setItem(storageKey, JSON.stringify(audioList.value));
};

// 切换当前播放的音频
const switchAudio = (audio) => {
  audioUrl.value = audio.url;
  text.value = audio.text;
  voiceId.value = audio.voiceId;
};

// 页面加载时读取本地存储的音频列表
onMounted(() => {
  loadAudioList();
});
</script>

<template>
  <div class="voice-clone-tts">
    <h1>语音复刻转语音</h1>

    <div class="form">
      <div class="form-item">
        <label>输入文本：</label>
        <textarea
          v-model="text"
          placeholder="请输入要转换的文本"
          rows="4"
        ></textarea>
      </div>

      <div class="form-item">
        <label>语音ID：</label>
        <input type="text" v-model="voiceId" placeholder="请输入复刻音频ID" />
      </div>

      <button @click="handleSubmit" :disabled="loading">
        {{ loading ? "转换中..." : "转换" }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- 音频播放器 -->
    <div v-if="audioUrl" class="audio-player">
      <audio :src="audioUrl" controls></audio>
    </div>

    <!-- 音频列表 -->
    <div v-if="audioList.length > 0" class="audio-list">
      <h2>历史记录</h2>
      <ul>
        <li
          v-for="audio in audioList"
          :key="audio.id"
          @click="switchAudio(audio)"
          :class="{ active: currentAudio === audio.url }"
        >
          <div class="audio-info">
            <div class="audio-text">{{ audio.text }}</div>
            <div class="audio-meta">
              <span class="voice-id">音色ID: {{ audio.voiceId }}</span>
              <span class="timestamp">{{ audio.timestamp }}</span>
            </div>
          </div>
          <span class="play-icon">▶</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.voice-clone-tts {
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

.form-item textarea,
.form-item input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-item textarea {
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
  padding: 15px;
  margin: 10px 0;
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

.audio-info {
  flex: 1;
  margin-right: 15px;
  word-break: break-all;
}

.audio-text {
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
}

.audio-meta {
  font-size: 12px;
  color: #666;
  display: flex;
  gap: 15px;
}

.play-icon {
  color: #4caf50;
  font-size: 20px;
}

.timestamp {
  color: #999;
}
</style>
