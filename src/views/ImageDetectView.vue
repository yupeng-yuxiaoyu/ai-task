<script setup>
import { ref } from 'vue'
import request from '../utils/request'

const imageUrl = ref('')
const loading = ref(false)
const result = ref(null)
const error = ref(null)

const handleSubmit = async () => {
  if (!imageUrl.value) {
    error.value = '请输入图片URL'
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
        imageUrl: imageUrl.value
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
</script>

<template>
  <div class="image-detect">
    <h1>人脸检测</h1>
    
    <div class="form">
      <div class="form-item">
        <label>图片URL：</label>
        <input 
          type="text" 
          v-model="imageUrl" 
          placeholder="请输入图片URL"
        >
      </div>
      
      <button 
        @click="handleSubmit" 
        :disabled="loading"
      >
        {{ loading ? '处理中...' : '提交' }}
      </button>
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
</style>