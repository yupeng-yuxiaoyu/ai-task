const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');  // 注意这里使用 @koa/cors
const axios = require('axios');
require('dotenv').config();

const app = new Koa();
const router = new Router();

// 使用中间件
app.use(cors({
  origin: '*',  // 在开发环境下允许所有来源
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser());

// 创建阿里云请求实例
const aliyunClient = axios.create({
  baseURL: 'https://dashscope.aliyuncs.com/api/v1',
  timeout: 10000,
  headers: {
    'Authorization': `Bearer ${process.env.API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// 图片检测接口
router.post('/api/face-detect', async (ctx) => {
  try {
    const { imageUrl } = ctx.request.body;

    if (!imageUrl) {
      ctx.status = 400;
      ctx.body = { error: '请提供图片URL' };
      return;
    }

    const response = await aliyunClient.post('/services/aigc/image2video/face-detect', {
      model: 'emo-detect-v1',
      input: {
        image_url: imageUrl
      },
      parameters: {
        ratio: '1:1'
      }
    });

    ctx.body = response.data;
  } catch (error) {
    ctx.status = error.response?.status || 500;
    ctx.body = {
      error: error.response?.data?.message || '服务器内部错误'
    };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});