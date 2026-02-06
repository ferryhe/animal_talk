#!/bin/bash

# Animal Talk - EC2 Update and Deployment Script
# 优化点：路径自适应、镜像自动清理、健康检查等待

set -e 

# 确保脚本在项目根目录下执行
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "Animal Talk - Updating..."
echo "=========================================="

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 1. 代码同步
echo -e "${BLUE}Step 1: Pulling latest code from Git...${NC}"
git pull origin main

# 2. 网络检查
echo -e "${BLUE}Step 2: Ensuring shared network exists...${NC}"
docker network inspect caddy_network >/dev/null 2>&1 || \
    docker network create caddy_network
echo -e "${GREEN}✓ Network ready${NC}"

# 3. 彻底清理 (包含清理无用镜像以释放空间)
echo -e "${BLUE}Step 3: Cleaning up old containers and images...${NC}"
docker compose down --remove-orphans
docker image prune -f  # 自动清理 dangling images，保护 40GB 硬盘
echo -e "${GREEN}✓ Cleanup completed${NC}"

# 4. 构建并启动
echo -e "${BLUE}Step 4: Building and starting containers...${NC}"
# --build 确保 Dockerfile 里的 npm install -g npm@latest 被执行
docker compose up -d --build --force-recreate

# 5. 等待健康检查 (针对新的 healthcheck 配置)
echo -e "${BLUE}Step 5: Waiting for application to become healthy...${NC}"
for i in {1..10}; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' animal_talk-app 2>/dev/null || echo "starting")
    if [ "$STATUS" == "healthy" ]; then
        echo -e "${GREEN}✓ Application is healthy!${NC}"
        break
    fi
    echo -n "."
    sleep 3
done

# 6. Caddy 重载
echo -e "${BLUE}Step 6: Reloading Caddy configuration...${NC}"
if docker ps | grep -q caddy; then
    docker exec caddy caddy reload --config /etc/caddy/Caddyfile
    echo -e "${GREEN}✓ Caddy reloaded${NC}"
else
    echo -e "${RED}⚠ Caddy container not found, skipping reload${NC}"
fi

# 7. 状态汇总
echo -e "${BLUE}Step 7: Final status:${NC}"
docker compose ps

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Update completed successfully!${NC}"
echo "=========================================="
