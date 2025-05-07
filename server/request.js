import axios from 'axios'

// 创建axios实例
const request = axios.create({
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',
    timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // config.headers['Authorization'] = `Bearer ${import.meta.env.VITE_API_KEY}`

        return config
    },
    error => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        return response.data
    },
    error => {
        return Promise.reject(error)
    }
)

export default request