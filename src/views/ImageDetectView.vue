<script setup>
import { ref } from 'vue'
import request from '../utils/request'

const imageUrl = ref('')
const audioUrl = ref('')  // 新增音频链接输入
const taskId = ref('')  // 新增taskId输入
const loading = ref(false)
const result = ref(null)
const error = ref(null)

const handleSubmit = async () => {
  if (!imageUrl.value) {
    error.value = '请输入图片URL'
    return
  }
  if (!audioUrl.value) {
    error.value = '请输入音频URL'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('http://localhost:3000/api/face-detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageUrl: imageUrl.value,
        audioUrl: audioUrl.value
      })
    })
    
    if (!response.ok) {
      throw new Error('请求失败')
    }
    
    const data = await response.json()
    result.value = data
  } catch (err) {
    error.value = '请求失败：' + err.message
  } finally {
    loading.value = false
  }
}

// 新增查询任务状态的方法
const queryTaskStatus = async () => {
  if (!taskId.value) {
    error.value = '请输入任务ID'
    return
  }

  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`http://localhost:3000/api/task-status/${taskId.value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('请求失败')
    }
    
    const data = await response.json()
    result.value = data
  } catch (err) {
    error.value = '查询失败：' + err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="image-detect">
    <h1>人脸检测与视频合成</h1>
    
    <div class="form">
      <div class="form-item">
        <label>图片URL：</label>
        <input 
          type="text" 
          v-model="imageUrl" 
          placeholder="请输入图片URL"
        >
      </div>
      
      <div class="form-item">
        <label>音频URL：</label>
        <input 
          type="text" 
          v-model="audioUrl" 
          placeholder="请输入音频URL"
        >
      </div>
      
      <button 
        @click="handleSubmit" 
        :disabled="loading"
      >
        {{ loading ? '处理中...' : '提交' }}
      </button>
      
      <!-- 新增任务状态查询表单 -->
      <div class="task-query">
        <h2>查询任务状态</h2>
        <div class="form-item">
          <label>任务ID：</label>
          <input 
            type="text" 
            v-model="taskId" 
            placeholder="请输入任务ID"
          >
        </div>
        
        <button 
          @click="queryTaskStatus" 
          :disabled="loading"
        >
          {{ loading ? '查询中...' : '查询状态' }}
        </button>
      </div>
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="result" class="result">
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.image-detect {
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
  padding: 8px 16px;
  background-color: #4CAF50;
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
</style>