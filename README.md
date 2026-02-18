# Animal Talk / 动物说话

<div align="center">

🐹 **WheekTalk** | 🐱 **MeowTalk** | 🐕 **BarkTalk**

A playful web application that helps you understand your pet's sounds through AI-powered audio recognition and community sharing.

[English](#english) | [中文](#中文)

</div>

---

## English

### ✨ Features

#### 🎧 Listen Mode
- **Fast Audio Recognition**: Advanced waveform comparison engine with 25-37% faster feedback (1.5-2.5s vs 2-4s)
- **High Accuracy**: Direct pattern matching against reference audio samples using multi-factor analysis
- **Smart Caching**: Pre-loads reference waveforms when you switch animals for instant comparison
- **Graceful Fallback**: Automatically uses feature-based analysis if waveform matching is unavailable

#### 📢 Say Mode
- Play synthesized animal vocalizations using Web Audio API
- Choose from multiple sound types for each animal
- High-quality, CC0-licensed audio samples from Freesound

#### 🌐 Community Features
- **Share Interpretations**: Post your pet's sound recognition results to the community
- **Vote on Accuracy**: Help others by voting on whether interpretations seem correct
- **Real-time Feed**: Browse community posts filtered by animal type
- **Anonymous System**: No login required - uses cookie-based user tracking

#### 🔧 Additional Features
- **Multi-Animal Support**: Switch between guinea pig, cat, and dog sound libraries
- **Bilingual UI**: Toggle between English and Chinese interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🛠️ Tech Stack

#### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Wouter** - Routing
- **TanStack Query** - Data fetching and caching
- **Radix UI** - Accessible component primitives

#### Backend
- **Express 5** - Server framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit (schema defined, optional PostgreSQL support)

#### Audio Processing
- **Web Audio API** - Browser-native audio processing
- **Custom Waveform Comparison** - Proprietary pattern matching algorithm

### 📁 Project Structure

```
animal_talk/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # React components (UI, Listen, Say, Community)
│   │   ├── lib/         # Audio recognition, waveform comparison utilities
│   │   ├── pages/       # Page components (Home, NotFound)
│   │   └── hooks/       # Custom React hooks
│   └── public/          # Static assets
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route handlers
│   └── storage.ts       # In-memory data storage
├── shared/              # Shared types and database schema
├── script/              # Build scripts
├── docs/                # Documentation archive
├── attached_assets/     # Animal sound samples (CC0 licensed)
└── dist/                # Production build output
```

### 📋 Requirements

- **Node.js** 20 or higher
- **npm** 9+ (comes with Node.js)
- **PostgreSQL** 16+ (optional, for persistent storage)

### 🚀 Getting Started

#### Installation
```bash
npm install
```

#### Development
```bash
# Start full-stack development server
npm run dev

# Frontend-only development (if you don't need API)
npm run dev:client
```

The app runs on `http://localhost:5000` in development.

#### Production Build
```bash
# Build both client and server
npm run build

# Run production server
npm start
```

Build outputs:
- Client assets: `dist/public/`
- Server bundle: `dist/index.cjs`

### 🔐 Environment Variables

```bash
PORT=5000                    # Server port (default: 5000)
DATABASE_URL=postgresql://   # PostgreSQL connection (optional)
```

### 📊 Database (Optional)

The app currently uses in-memory storage. Database schema is defined in `shared/schema.ts` and ready for PostgreSQL.

To enable PostgreSQL:
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/animal_talk"

# Push schema to database
npm run db:push
```

### 🚢 Deployment

#### Option 1: Node.js Server (Recommended)
Deploys both frontend and backend together.

```bash
npm run build
PORT=5000 npm start
```

#### Option 2: Static Hosting
Deploy only the frontend (no API features).

```bash
npm run build
# Deploy dist/public/ to Netlify, Vercel, S3, etc.
```

#### Option 3: Docker + Caddy (Production)
Uses Docker containers with Caddy reverse proxy and automatic HTTPS.

```bash
# Build and start containers
docker compose up -d --build
```

**Important**: Microphone access requires HTTPS in production. Use a domain name with Caddy for automatic TLS certificates.

Configuration files:
- `Dockerfile` - Container image definition
- `docker-compose.yml` - Multi-container setup
- `Caddyfile` - Reverse proxy and HTTPS configuration

### 📚 Documentation

Detailed technical documentation is archived in the `docs/` directory:

- **Performance Improvements**: See `docs/20260218-improvements.md`
- **Social Features**: See `docs/20260218-social-features.md`
- **Quick Start Guide**: See `docs/20260218-social-features-quickstart.md`
- **中文总结**: See `docs/20260218-improvements-summary-zh.md`

### 🎨 Third-Party Assets

All animal sound samples are from Freesound.org under CC0 (Public Domain) license:

**Guinea Pig Sounds**:
- `guinea-pigs-cc0.mp3` - [Breviceps](https://freesound.org/people/Breviceps/sounds/540477/)

**Cat Sounds**:
- `cat-meow-1-cc0.mp3` - [qubodup](https://freesound.org/people/qubodup/sounds/813119/)
- `cat-meow-2-cc0.mp3` - [qubodup](https://freesound.org/people/qubodup/sounds/813113/)
- `cat-purr-1-cc0.mp3` - [rareguy27](https://freesound.org/people/rareguy27/sounds/690620/)
- `cat-purr-2-cc0.mp3` - [soundofsong](https://freesound.org/people/soundofsong/sounds/650575/)

**Dog Sounds**:
- `dog-bark-1-cc0.mp3` - [qubodup](https://freesound.org/people/qubodup/sounds/813120/)
- `dog-bark-2-cc0.mp3` - [MWF77](https://freesound.org/people/MWF77/sounds/788196/)
- `dog-whine-1-cc0.mp3` - [Breviceps](https://freesound.org/people/Breviceps/sounds/462660/)
- `dog-whine-2-cc0.mp3` - [T_saurus](https://freesound.org/people/T_saurus/sounds/742053/)
- `dog-howl-1-cc0.mp3` - [simcotter](https://freesound.org/people/simcotter/sounds/115357/)
- `dog-howl-2-cc0.mp3` - [chris5s](https://freesound.org/people/chris5s/sounds/835850/)
- `dog-pant-1-cc0.mp3` - [PanFlutist](https://freesound.org/people/PanFlutist/sounds/724909/)
- `dog-pant-2-cc0.mp3` - [qubodup](https://freesound.org/people/qubodup/sounds/827433/)

### 🤝 Contributing

This is an educational project. Feel free to fork and experiment!

### 📄 License

MIT License - See LICENSE file for details

---

## 中文

### ✨ 功能特性

#### 🎧 听声模式
- **快速音频识别**：先进的波形对比引擎，反馈速度提升25-37%（1.5-2.5秒 vs 2-4秒）
- **高准确度**：使用多因素分析直接对比参考音频样本进行模式匹配
- **智能缓存**：切换动物时预加载参考波形，实现即时对比
- **优雅降级**：波形匹配不可用时自动使用基于特征的分析

#### 📢 说话模式
- 使用Web Audio API播放合成的动物叫声
- 为每种动物提供多种声音类型选择
- 高质量CC0许可的Freesound音频样本

#### 🌐 社区功能
- **分享解读**：将宠物声音识别结果发布到社区
- **投票评价**：通过投票帮助他人判断解读是否准确
- **实时动态**：浏览按动物类型筛选的社区帖子
- **匿名系统**：无需登录 - 使用基于Cookie的用户追踪

#### 🔧 其他功能
- **多动物支持**：在豚鼠、猫和狗声音库之间切换
- **双语界面**：在英文和中文界面之间切换
- **响应式设计**：在桌面和移动设备上无缝运行

### 🛠️ 技术栈

#### 前端
- **React 19** - UI框架
- **Vite 7** - 构建工具和开发服务器
- **Tailwind CSS 4** - 样式
- **Framer Motion** - 动画
- **Wouter** - 路由
- **TanStack Query** - 数据获取和缓存
- **Radix UI** - 可访问的组件原语

#### 后端
- **Express 5** - 服务器框架
- **TypeScript** - 类型安全
- **Drizzle ORM** - 数据库工具包（已定义模式，可选PostgreSQL支持）

#### 音频处理
- **Web Audio API** - 浏览器原生音频处理
- **自定义波形对比** - 专有模式匹配算法

### 📁 项目结构

```
animal_talk/
├── client/              # React前端应用
│   ├── src/
│   │   ├── components/  # React组件（UI、听声、说话、社区）
│   │   ├── lib/         # 音频识别、波形对比工具
│   │   ├── pages/       # 页面组件（主页、404）
│   │   └── hooks/       # 自定义React钩子
│   └── public/          # 静态资源
├── server/              # Express后端
│   ├── index.ts         # 服务器入口
│   ├── routes.ts        # API路由处理器
│   └── storage.ts       # 内存数据存储
├── shared/              # 共享类型和数据库模式
├── script/              # 构建脚本
├── docs/                # 文档归档
├── attached_assets/     # 动物声音样本（CC0许可）
└── dist/                # 生产构建输出
```

### 📋 系统要求

- **Node.js** 20或更高版本
- **npm** 9+（Node.js自带）
- **PostgreSQL** 16+（可选，用于持久化存储）

### 🚀 快速开始

#### 安装
```bash
npm install
```

#### 开发
```bash
# 启动全栈开发服务器
npm run dev

# 仅前端开发（如果不需要API）
npm run dev:client
```

开发环境运行在 `http://localhost:5000`。

#### 生产构建
```bash
# 构建客户端和服务器
npm run build

# 运行生产服务器
npm start
```

构建输出：
- 客户端资源：`dist/public/`
- 服务器包：`dist/index.cjs`

### 🔐 环境变量

```bash
PORT=5000                    # 服务器端口（默认：5000）
DATABASE_URL=postgresql://   # PostgreSQL连接（可选）
```

### 📊 数据库（可选）

应用当前使用内存存储。数据库模式已在 `shared/schema.ts` 中定义，可随时启用PostgreSQL。

启用PostgreSQL：
```bash
# 设置DATABASE_URL环境变量
export DATABASE_URL="postgresql://user:password@localhost:5432/animal_talk"

# 推送模式到数据库
npm run db:push
```

### 🚢 部署

#### 选项1：Node.js服务器（推荐）
前后端一起部署。

```bash
npm run build
PORT=5000 npm start
```

#### 选项2：静态托管
仅部署前端（无API功能）。

```bash
npm run build
# 将dist/public/部署到Netlify、Vercel、S3等
```

#### 选项3：Docker + Caddy（生产环境）
使用Docker容器配合Caddy反向代理和自动HTTPS。

```bash
# 构建并启动容器
docker compose up -d --build
```

**重要**：生产环境中麦克风访问需要HTTPS。使用域名配合Caddy获取自动TLS证书。

配置文件：
- `Dockerfile` - 容器镜像定义
- `docker-compose.yml` - 多容器配置
- `Caddyfile` - 反向代理和HTTPS配置

### 📚 文档

详细技术文档归档在 `docs/` 目录：

- **性能改进**：参见 `docs/20260218-improvements.md`
- **社区功能**：参见 `docs/20260218-social-features.md`
- **快速入门指南**：参见 `docs/20260218-social-features-quickstart.md`
- **中文改进总结**：参见 `docs/20260218-improvements-summary-zh.md`

### 🎨 第三方资源

所有动物声音样本来自Freesound.org，使用CC0（公共领域）许可：

**豚鼠声音**：
- `guinea-pigs-cc0.mp3` - [Breviceps](https://freesound.org/people/Breviceps/sounds/540477/)

**猫声音**：
- `cat-meow-1-cc0.mp3` - [qubodup](https://freesound.org/people/qubodup/sounds/813119/)
- `cat-meow-2-cc0.mp3` - [qubodup](https://freesound.org/people/qubodup/sounds/813113/)
- `cat-purr-1-cc0.mp3` - [rareguy27](https://freesound.org/people/rareguy27/sounds/690620/)
- `cat-purr-2-cc0.mp3` - [soundofsong](https://freesound.org/people/soundofsong/sounds/650575/)

**狗声音**：
- `dog-bark-1-cc0.mp3` - [qubodup](https://freesound.org/people/qubodup/sounds/813120/)
- `dog-bark-2-cc0.mp3` - [MWF77](https://freesound.org/people/MWF77/sounds/788196/)
- `dog-whine-1-cc0.mp3` - [Breviceps](https://freesound.org/people/Breviceps/sounds/462660/)
- `dog-whine-2-cc0.mp3` - [T_saurus](https://freesound.org/people/T_saurus/sounds/742053/)
- `dog-howl-1-cc0.mp3` - [simcotter](https://freesound.org/people/simcotter/sounds/115357/)
- `dog-howl-2-cc0.mp3` - [chris5s](https://freesound.org/people/chris5s/sounds/835850/)
- `dog-pant-1-cc0.mp3` - [PanFlutist](https://freesound.org/people/PanFlutist/sounds/724909/)
- `dog-pant-2-cc0.mp3` - [qubodup](https://freesound.org/people/qubodup/sounds/827433/)

### 🤝 贡献

这是一个教育项目。欢迎Fork和实验！

### 📄 许可证

MIT许可证 - 详见LICENSE文件
