# AI 多模态应用

这是一个基于 Vue 3 和 Koa 构建的 AI 多模态应用，集成了阿里云灵积模型服务，提供人物唱歌、音频复刻、文本转语音等多种 AI 功能。

## 功能特点

- **人物唱歌**：上传人物图片和音频，生成人物唱歌视频
- **音频复刻**：上传音频样本，复刻用户声音
- **文本转语音 TTS**：将文本转换为自然语音
- **语音复刻转语音**：使用复刻的声音进行文本转语音
- **Sambert 文本转语音**：使用 Sambert 模型进行文本转语音

## 技术栈

### 前端
- Vue 3 (组合式 API)
- Vue Router
- Pinia 状态管理
- Vant UI 组件库
- Axios 网络请求

### 后端
- Koa2 框架
- WebSocket 实时通信
- Winston 日志系统
- 阿里云灵积 API 集成

## 项目结构

```
ai-task/
├── public/                 # 静态资源
├── server/                 # 后端服务
│   ├── app.js             # 主服务入口
│   ├── logger.js          # 日志配置
│   ├── request.js         # 请求工具
│   └── ws.js              # WebSocket 服务
└── src/                    # 前端源码
    ├── assets/            # 静态资源
    ├── components/        # 公共组件
    ├── router/            # 路由配置
    ├── stores/            # Pinia 状态管理
    ├── utils/             # 工具函数
    ├── views/             # 页面组件
    ├── App.vue            # 根组件
    └── main.js            # 入口文件
```

## 环境要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本

## 安装与运行

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..
```

### 配置环境变量

在项目根目录创建 `.env` 文件，添加以下配置：

```
API_KEY=你的阿里云灵积API密钥
PORT=3000
```

### 开发环境运行

```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务
npm run server
```

### 生产环境构建

```bash
# 构建前端
npm run build

# 启动生产环境服务
node server/app.js
```

## API 接口说明

### 人物唱歌

- **接口**：`/api/face-detect`
- **方法**：POST
- **参数**：
  - `imageUrl`: 人物图片 URL
  - `audioUrl`: 音频 URL

### 查询任务状态

- **接口**：`/api/task-status/:taskId`
- **方法**：GET
- **参数**：
  - `taskId`: 任务 ID

### 音频复刻

- **接口**：`/api/voice-clone`
- **方法**：POST
- **参数**：
  - `audioUrl`: 音频 URL

### 查询音频列表

- **接口**：`/api/voice-list`
- **方法**：GET

### 文本转语音

- **接口**：`/api/text-to-speech`
- **方法**：POST
- **参数**：
  - `text`: 要转换的文本内容

## 开发指南

### 推荐的 IDE 设置

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (禁用 Vetur)

### 自定义配置

查看 [Vite 配置参考](https://cn.vitejs.dev/config/)。

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 许可证

ISC

## 作者

yupeng12
