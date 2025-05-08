const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const axios = require('axios');
const logger = require('./logger');
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
    timeout: 30000,  // 将超时时间改为30秒
    headers: {
        'Authorization': `Bearer ${process.env.API_KEY}`,
        'Content-Type': 'application/json'
    }
});

// 添加请求日志中间件
app.use(async (ctx, next) => {
    const start = Date.now();
    try {
        await next();
        const ms = Date.now() - start;
        logger.info({
            method: ctx.method,
            url: ctx.url,
            status: ctx.status,
            duration: `${ms}ms`,
            ip: ctx.ip
        });
    } catch (error) {
        const ms = Date.now() - start;
        logger.error({
            method: ctx.method,
            url: ctx.url,
            status: ctx.status || 500,
            duration: `${ms}ms`,
            ip: ctx.ip,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
});

// 图片检测接口
router.post('/api/face-detect', async (ctx) => {
    try {
        const { imageUrl, audioUrl } = ctx.request.body;

        if (!imageUrl) {
            logger.warn({
                message: '请求缺少图片URL',
                body: ctx.request.body
            });
            ctx.status = 400;
            ctx.body = { error: '请提供图片URL' };
            return;
        }

        logger.info({
            message: '开始处理图片检测请求',
            imageUrl: imageUrl
        });

        const faceDetectResponse = await aliyunClient.post('/services/aigc/image2video/face-detect', {
            model: 'emo-detect-v1',
            input: {
                image_url: imageUrl
            },
            parameters: {
                ratio: '1:1'
            }
        });

        logger.info({
            message: '图片检测请求成功',
            imageUrl: imageUrl,
            responseStatus: faceDetectResponse.status,
            data: faceDetectResponse.data
        });

        // 只记录响应数据，避免循环引用问题
        console.log('人物唱歌响应数据 >> ', JSON.stringify(faceDetectResponse.data));

        // 如果人物唱歌通过，继续请求视频合成
        if (faceDetectResponse.data.output.check_pass) {
            logger.info({
                message: '人物唱歌通过，开始视频合成',
                faceDetectResult: faceDetectResponse.data
            });

            const videoSynthesisResponse = await aliyunClient.post('/services/aigc/image2video/video-synthesis/', {
                model: "emo-v1",
                input: {
                    image_url: imageUrl,
                    audio_url: audioUrl,
                    face_bbox: faceDetectResponse.data.output.face_bbox,
                    ext_bbox: faceDetectResponse.data.output.ext_bbox
                },
                parameters: {
                    style_level: "normal"
                }
            }, {
                headers: {
                    'X-DashScope-Async': 'enable'
                }
            });

            logger.info({
                message: '视频合成请求成功',
                synthesisResponse: videoSynthesisResponse.data
            });

            ctx.body = {
                faceDetect: faceDetectResponse.data,
                videoSynthesis: videoSynthesisResponse.data
            };
        } else {
            ctx.body = {
                faceDetect: faceDetectResponse.data,
                error: '人物唱歌未通过'
            };
        }
    } catch (error) {
        const { imageUrl, audioUrl } = ctx.request.body;

        logger.error({
            message: '请求处理失败',
            imageUrl: imageUrl,
            audioUrl: audioUrl,
            error: error.message,
            stack: error.stack
        });

        ctx.status = error.response?.status || 500;
        ctx.body = {
            error: error.response?.data?.message || '服务器内部错误'
        };
    }
});

// 查询任务状态接口
router.get('/api/task-status/:taskId', async (ctx) => {
    try {
        const { taskId } = ctx.params;

        if (!taskId) {
            logger.warn({
                message: '请求缺少任务ID',
                params: ctx.params
            });
            ctx.status = 400;
            ctx.body = { error: '请提供任务ID' };
            return;
        }

        logger.info({
            message: '开始查询任务状态',
            taskId: taskId
        });

        const response = await aliyunClient.get(`/tasks/${taskId}`);

        logger.info({
            message: '任务状态查询成功',
            taskId: taskId,
            responseStatus: response.status,
            data: response.data
        });

        ctx.body = response.data;
    } catch (error) {
        logger.error({
            message: '任务状态查询失败',
            taskId: taskId,
            error: error.message,
            stack: error.stack
        });

        ctx.status = error.response?.status || 500;
        ctx.body = {
            error: error.response?.data?.message || '服务器内部错误'
        };
    }
});

// 音频复刻接口
router.post('/api/voice-clone', async (ctx) => {
    try {
        const { audioUrl } = ctx.request.body;

        if (!audioUrl) {
            logger.warn({
                message: '请求缺少音频URL',
                body: ctx.request.body
            });
            ctx.status = 400;
            ctx.body = { error: '请提供音频URL' };
            return;
        }

        logger.info({
            message: '开始处理音频复刻请求',
            audioUrl: audioUrl
        });

        const response = await aliyunClient.post('/services/audio/tts/customization', {
            model: "voice-enrollment",
            input: {
                action: "create_voice",
                target_model: "cosyvoice-v2",
                prefix: "yuxiaoyu",
                url: audioUrl
            }
        });

        logger.info({
            message: '音频复刻请求成功',
            audioUrl: audioUrl,
            responseStatus: response.status,
            data: response.data
        });

        ctx.body = response.data;
    } catch (error) {
        logger.error({
            message: '音频复刻请求失败',
            audioUrl: ctx.request.body.audioUrl,
            error: error.message,
            stack: error.stack
        });

        ctx.status = error.response?.status || 500;
        ctx.body = {
            error: error.response?.data?.message || '服务器内部错误'
        };
    }
});

// 查询音频列表接口
router.get('/api/voice-list', async (ctx) => {
    try {
        logger.info({
            message: '开始查询音频列表'
        });

        const response = await aliyunClient.post('/services/audio/tts/customization', {
            model: "voice-enrollment",
            input: {
                action: "list_voice",
                prefix: "yuxiaoyu",
                page_index: 0,
                page_size: 100
            }
        });

        logger.info({
            message: '音频列表查询成功',
            responseStatus: response.status,
            data: response.data
        });

        ctx.body = response.data;
    } catch (error) {
        logger.error({
            message: '音频列表查询失败',
            error: error.message,
            stack: error.stack
        });

        ctx.status = error.response?.status || 500;
        ctx.body = {
            error: error.response?.data?.message || '服务器内部错误'
        };
    }
});

// 文本转语音TTS接口
router.post('/api/text-to-speech', async (ctx) => {
    try {
        const { text } = ctx.request.body;

        if (!text) {
            logger.warn({
                message: '请求缺少文本内容',
                body: ctx.request.body
            });
            ctx.status = 400;
            ctx.body = { error: '请提供文本内容' };
            return;
        }

        logger.info({
            message: '开始处理文本转语音TTS请求',
            text: text
        });

        const response = await aliyunClient.post('/services/aigc/multimodal-generation/generation', {
            model: "qwen-tts",
            input: {
                text: text,
                voice: "Chelsie"
            }
        });

        logger.info({
            message: '文本转语音TTS请求成功',
            responseStatus: response.status,
            data: response.data
        });

        ctx.body = response.data;
    } catch (error) {
        logger.error({
            message: '文本转语音TTS请求失败',
            text: ctx.request.body.text,
            error: error.message,
            stack: error.stack
        });

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