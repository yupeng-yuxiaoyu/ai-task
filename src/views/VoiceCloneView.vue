<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { showToast } from "vant";

const route = useRoute();
const audioUrl = ref("");
const loading = ref(false);
const error = ref(null);
const voiceList = ref([]);

// 获取当前路由作为存储前缀
const storageKey = `${route.path}_voice_list`;

// 从localStorage加载语音列表
const loadVoiceList = () => {
  const savedList = localStorage.getItem(storageKey);
  if (savedList) {
    voiceList.value = JSON.parse(savedList);
  }
};

// 保存语音ID到列表
const saveVoiceId = (voiceId) => {
  if (!voiceList.value.includes(voiceId)) {
    voiceList.value.push(voiceId);
    localStorage.setItem(storageKey, JSON.stringify(voiceList.value));
  }
};

// 页面加载时读取本地存储的语音列表
onMounted(() => {
  loadVoiceList();
});

const handleSubmit = async () => {
  if (!audioUrl.value) {
    error.value = "请输入音频URL";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("http://localhost:3000/api/voice-clone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audioUrl: audioUrl.value,
      }),
    });

    if (!response.ok) {
      throw new Error("请求失败");
    }

    const data = await response.json();
    // 保存voice_id到本地存储
    if (data.output?.voice_id) {
      saveVoiceId(data.output.voice_id);
    }
  } catch (err) {
    error.value = "请求失败：" + err.message;
  } finally {
    loading.value = false;
  }
};

// 复制文本到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast("复制成功");
  } catch (err) {
    console.error("复制失败:", err);
    showToast("复制失败");
  }
};

// 查询音频列表
const fetchVoiceList = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/voice-list");
    if (!response.ok) {
      throw new Error("查询失败");
    }
    const data = await response.json();
    if (data.output?.voice_list) {
      // 更新本地存储的列表
      voiceList.value = data.output.voice_list.map(item => item.voice_id);
      localStorage.setItem(storageKey, JSON.stringify(voiceList.value));
      showToast("列表更新成功");
    }
  } catch (err) {
    console.error("查询失败:", err);
    showToast("查询失败");
  }
};
</script>

<template>
  <div class="voice-clone">
    <h1>音频复刻</h1>

    <div class="form">
      <div class="form-item">
        <label>音频URL：</label>
        <input type="text" v-model="audioUrl" placeholder="请输入音频URL" />
      </div>

      <button @click="handleSubmit" :disabled="loading">
        {{ loading ? "处理中..." : "提交" }}
      </button>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- 语音ID列表 -->
    <div class="voice-list">
      <div class="voice-list-header">
        <h2>语音ID列表</h2>
        <button class="refresh-btn" @click="fetchVoiceList">
          刷新列表
        </button>
      </div>
      <ul v-if="voiceList.length > 0">
        <li v-for="voiceId in voiceList" :key="voiceId" class="voice-list-item">
          <span class="voice-id">{{ voiceId }}</span>
          <button class="copy-btn" @click="copyToClipboard(voiceId)">
            复制
          </button>
        </li>
      </ul>
      <div v-else class="empty-list">
        暂无语音ID
      </div>
    </div>
  </div>
</template>

<style scoped>
.voice-clone {
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

.form-item input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.voice-list {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.voice-list h2 {
  margin-bottom: 15px;
  color: #333;
}

.voice-list ul {
  list-style: none;
  padding: 0;
}

.voice-list li {
  padding: 10px;
  margin: 5px 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voice-id {
  flex: 1;
  margin-right: 10px;
  word-break: break-all;
}

.copy-btn {
  padding: 4px 12px;
  font-size: 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background-color: #45a049;
}

.copy-btn:active {
  background-color: #3d8b40;
}

.voice-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.refresh-btn {
  padding: 6px 12px;
  font-size: 14px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover {
  background-color: #1976D2;
}

.refresh-btn:active {
  background-color: #1565C0;
}

.empty-list {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>
