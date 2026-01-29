# 构建阶段
FROM node:20-alpine AS build

WORKDIR /app

# 更新 npm
RUN npm install -g npm@latest

# 复制依赖文件
COPY package.json package-lock.json* ./

# 安装所有依赖
RUN npm install

# 复制源代码并构建
COPY . .
RUN npm run build

# 运行阶段
FROM node:20-alpine AS runtime

WORKDIR /app

# 更新生产环境 npm 并清理缓存以减小体积
RUN npm install -g npm@latest && npm cache clean --force

ENV NODE_ENV=production
ENV PORT=5000

# 只安装生产依赖
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --prefer-offline --no-audit && npm cache clean --force

# 从构建阶段复制结果
COPY --from=build /app/dist ./dist

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["node", "dist/index.cjs"]
