# Animal Talk — Taro 微信小程序

基于 Taro 框架的微信小程序版本，支持录音识别和播放动物声音。

## 快速开始

### 1. 安装依赖
```bash
cd mp
npm install
```

### 2. 编译项目
```bash
# 编译（打包发布）
npm run build:weapp

# 或者开发模式（实时编译）
npm run dev:weapp
```

### 3. 在微信开发者工具中打开
- 打开微信开发者工具
- 点击"打开项目"
- 选择 `mp/dist` 文件夹（不是 `mp` 本身）
- AppID 可为空，点击"打开"即可预览

## 项目结构

```
mp/
├── src/
│   ├── pages/
│   │   ├── listen/index.tsx    # 录音页面
│   │   └── say/index.tsx       # 播放页面
│   ├── api/index.ts            # API 请求封装
│   ├── app.tsx                 # 小程序入口
│   ├── app.css                 # 全局样式
│   ├── index.tsx               # React 入口
│   ├── index.html              # HTML 模板
│   └── types.d.ts              # TypeScript 类型定义
├── config/index.js             # Taro 配置
├── project.config.json         # 微信开发者工具配置
├── tsconfig.json               # TypeScript 配置
└── package.json                # 依赖管理
```

## 开发指南

### 编辑代码后自动编译
```bash
npm run dev:weapp
```
然后在微信开发者工具中按 `Ctrl+R`（Windows）或 `Cmd+R`（macOS）刷新。

### 调用后端 API
所有 API 调用都在 `src/api/index.ts` 中定义，会自动连接到后端 Express 服务：

```typescript
import { fetchSounds, postAnalysis } from '@/api';

// 获取动物声音列表
const sounds = await fetchSounds('cat');

// 提交分析结果
const result = await postAnalysis({ audioPath: '...' });
```

### 使用小程序原生能力
通过 Taro API 访问录音、播放等功能：

```typescript
import Taro from '@tarojs/taro';

// 获取录音管理器
const recorder = Taro.getRecorderManager();
recorder.start({ format: 'mp3' });

// 创建音频上下文并播放
const audio = Taro.createInnerAudioContext();
audio.src = 'https://example.com/sound.mp3';
audio.autoplay = true;
```

## 环境变量
在 `mp/` 下创建 `.env.local`：

```
BACKEND_URL=http://localhost:5000
```

在 `src/api/index.ts` 中读取：

```typescript
const BASE = process.env.BACKEND_URL || 'http://localhost:5000';
```

## 打包发布

1. 确保代码已编译：
   ```bash
   npm run build:weapp
   ```

2. 在微信开发者工具中：
   - 点击"上传"
   - 选择版本号和备注信息
   - 点击"上传"

3. 在微信公众平台后台进行版本管理和发布

## 相关链接
- [Taro 官方文档](https://taro-docs.jd.com/)
- [小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Express 后端](../server/)
- [Web 版本](../client/)
