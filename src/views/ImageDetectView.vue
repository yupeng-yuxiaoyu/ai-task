<script setup>
import { ref, onMounted } from "vue";
import request from "../utils/request";

const imageUrl = ref("");
const audioUrl = ref("");
const taskId = ref("");
const loading = ref(false);
const result = ref(null);
const error = ref(null);
const taskList = ref([]); // 存储taskId的数组
const currentVideoUrl = ref(""); // 当前展示的视频URL

// 从localStorage加载任务列表
const loadTaskList = () => {
  const savedList = localStorage.getItem("taskList");
  if (savedList) {
    taskList.value = JSON.parse(savedList);
  }
};

// 保存任务信息到列表
const saveTaskInfo = (taskId, videoUrl = "", status = "PENDING") => {
  const taskInfo = {
    id: taskId,
    videoUrl: videoUrl,
    status: status,
  };
  // 检查是否已存在相同的taskId
  const existingIndex = taskList.value.findIndex((task) => task.id === taskId);
  if (existingIndex === -1) {
    taskList.value.push(taskInfo);
  } else {
    taskList.value[existingIndex] = taskInfo;
  }
  localStorage.setItem("taskList", JSON.stringify(taskList.value));
};

const handleSubmit = async () => {
  if (!imageUrl.value) {
    error.value = "请输入图片URL";
    return;
  }
  if (!audioUrl.value) {
    error.value = "请输入音频URL";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch("http://localhost:3000/api/face-detect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: imageUrl.value,
        audioUrl: audioUrl.value,
      }),
    });

    if (!response.ok) {
      throw new Error("请求失败");
    }

    const data = await response.json();
    result.value = data;

    // 检查并保存任务ID
    if (data.videoSynthesis?.output?.task_id) {
      const newTaskId = data.videoSynthesis.output.task_id;
      const taskStatus = data.videoSynthesis.output.task_status || "PENDING";
      saveTaskInfo(newTaskId, "", taskStatus);
      taskId.value = newTaskId; // 自动填充任务ID到输入框
    }
  } catch (err) {
    error.value = "请求失败：" + err.message;
  } finally {
    loading.value = false;
  }
};

// 选择任务并更新视频URL
const selectTask = (taskInfo) => {
  currentVideoUrl.value = taskInfo.videoUrl;
  taskId.value = taskInfo.id;
};

// 页面加载时读取本地存储的任务列表
onMounted(() => {
  loadTaskList();
});

// 新增查询任务状态的方法
const queryTaskStatus = async () => {
  if (!taskId.value) {
    error.value = "请输入任务ID";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(
      `http://localhost:3000/api/task-status/${taskId.value}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("请求失败");
    }

    const data = await response.json();
    result.value = data;

    // 检查任务状态并保存视频URL
    if (
      data.output?.task_status === "SUCCEEDED" &&
      data.output?.results?.video_url
    ) {
      saveTaskInfo(taskId.value, data.output.results.video_url);
      currentVideoUrl.value = data.output.results.video_url;
    }
  } catch (err) {
    error.value = "查询失败：" + err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="image-detect">
    <h1>图片唱歌</h1>

    <div class="form">
      <div class="form-item">
        <label>图片URL：</label>
        <input type="text" v-model="imageUrl" placeholder="请输入图片URL" />
      </div>

      <div class="form-item">
        <label>音频URL：</label>
        <input type="text" v-model="audioUrl" placeholder="请输入音频URL" />
      </div>

      <button @click="handleSubmit" :disabled="loading">
        {{ loading ? "处理中..." : "提交" }}
      </button>

      <!-- 新增任务状态查询表单 -->
      <div class="task-query">
        <h2>查询任务状态</h2>
        <div class="form-item">
          <label>任务ID：</label>
          <input type="text" v-model="taskId" placeholder="请输入任务ID" />
        </div>

        <button @click="queryTaskStatus" :disabled="loading">
          {{ loading ? "查询中..." : "查询状态" }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <!-- 任务列表和视频展示 -->
    <div class="task-video-container">
      <!-- 任务列表 -->
      <div class="task-list" v-if="taskList.length > 0">
        <h2>任务列表</h2>
        <ul>
          <li
            v-for="task in taskList"
            :key="task.id"
            :class="{ active: task.id === taskId }"
            @click="selectTask(task)"
          >
            <div class="task-info">
              <div class="task-id">任务ID: {{ task.id }}</div>
              <div class="task-status">状态: {{ task.status }}</div>
            </div>
          </li>
        </ul>
      </div>

      <!-- 视频播放器 -->
      <div class="video-container" v-if="currentVideoUrl">
        <h2>视频播放</h2>
        <video :src="currentVideoUrl" controls class="video-player">
          您的浏览器不支持 video 标签。
        </video>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-detect {
  max-width: 800px;
  margin: 0 auto;
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
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
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

.task-query {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.task-video-container {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.task-list {
  flex: 1;
  max-width: 300px;
}

.task-list ul {
  list-style: none;
  padding: 0;
}

.task-list li {
  padding: 10px;
  margin: 5px 0;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.task-list li:hover {
  background-color: #e0e0e0;
}

.task-list li.active {
  background-color: #4caf50;
  color: white;
}

.video-container {
  flex: 2;
}

.video-player {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
