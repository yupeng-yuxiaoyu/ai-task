const WebSocket = require('ws');
const uuid = require('uuid').v4;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const apiKey = process.env.API_KEY;
const wsUrl = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference/';

// 创建WebSocket服务器
const createWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('客户端已连接');

    ws.on('message', async (message) => {
      try {
        const { text, voiceId } = JSON.parse(message);
        
        // 创建与阿里云的WebSocket连接
        const aliyunWs = new WebSocket(wsUrl, {
          headers: {
            Authorization: `bearer ${apiKey}`,
            'X-DashScope-DataInspection': 'enable'
          }
        });

        const taskId = uuid();
        const outputDir = path.join(__dirname, 'public', 'audio');
        const outputFilePath = path.join(outputDir, `${taskId}.mp3`);

        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // 清空输出文件
        fs.writeFileSync(outputFilePath, '');
        const fileStream = fs.createWriteStream(outputFilePath, { flags: 'a' });

        let taskStarted = false;

        aliyunWs.on('open', () => {
          // 发送run-task指令
          const runTaskMessage = {
            header: {
              action: 'run-task',
              task_id: taskId,
              streaming: 'duplex'
            },
            payload: {
              task_group: 'audio',
              task: 'tts',
              function: 'SpeechSynthesizer',
              model: 'cosyvoice-v2',
              parameters: {
                text_type: 'PlainText',
                voice: voiceId,
                format: 'mp3',
                sample_rate: 22050,
                volume: 50,
                rate: 1,
                pitch: 1
              },
              input: {}
            }
          };
          aliyunWs.send(JSON.stringify(runTaskMessage));
        });

        aliyunWs.on('message', (data, isBinary) => {
          if (isBinary) {
            fileStream.write(data);
          } else {
            const response = JSON.parse(data);

            switch (response.header.event) {
              case 'task-started':
                taskStarted = true;
                // 发送continue-task指令
                if (taskStarted) {
                  const continueTaskMessage = {
                    header: {
                      action: 'continue-task',
                      task_id: taskId,
                      streaming: 'duplex'
                    },
                    payload: {
                      input: {
                        text: text
                      }
                    }
                  };
                  aliyunWs.send(JSON.stringify(continueTaskMessage));
                }
                break;

              case 'task-finished':
                fileStream.end(() => {
                  // 发送音频URL给客户端
                  ws.send(JSON.stringify({
                    type: 'audio',
                    url: `http://localhost:3000/audio/${taskId}.mp3`
                  }));
                });
                aliyunWs.close();
                break;

              case 'task-failed':
                ws.send(JSON.stringify({
                  type: 'error',
                  message: response.header.error_message
                }));
                aliyunWs.close();
                fileStream.end();
                break;
            }
          }
        });

        // 发送finish-task指令
        setTimeout(() => {
          if (taskStarted) {
            const finishTaskMessage = {
              header: {
                action: 'finish-task',
                task_id: taskId,
                streaming: 'duplex'
              },
              payload: {
                input: {}
              }
            };
            aliyunWs.send(JSON.stringify(finishTaskMessage));
          }
        }, 2000);

      } catch (error) {
        console.error('处理消息时出错:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: '服务器处理失败'
        }));
      }
    });

    ws.on('close', () => {
      console.log('客户端已断开连接');
    });
  });

  return wss;
};

module.exports = createWebSocketServer;