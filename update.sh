#!/bin/bash

# Animal Talk - EC2 Update and Deployment Script
# This script pulls the latest code and restarts the Docker containers

set -e  # Exit on error

echo "=========================================="
echo "Animal Talk - Updating..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code from Git
echo -e "${BLUE}Step 1: Pulling latest code from Git...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Git pull completed successfully${NC}"
else
    echo -e "${RED}✗ Git pull failed${NC}"
    exit 1
fi

# Step 2: Create shared network if it doesn't exist
echo -e "${BLUE}Step 2: Ensuring shared network exists...${NC}"
docker network create caddy_network 2>/dev/null || echo "Network already exists"
echo -e "${GREEN}✓ Network ready${NC}"

# Step 3: Stop and remove existing containers
echo -e "${BLUE}Step 3: Stopping and removing existing containers...${NC}"
docker compose down --remove-orphans
docker rm -f animal_talk-app 2>/dev/null || true
echo -e "${GREEN}✓ Containers cleaned up${NC}"

# Step 4: Remove old images (optional - uncomment to clean up old images)
# echo -e "${BLUE}Step 4: Cleaning up old images...${NC}"
# docker image prune -f
# echo -e "${GREEN}✓ Old images removed${NC}"

# Step 5: Build and start containers
echo -e "${BLUE}Step 4: Building and starting containers...${NC}"
docker compose up -d --build --force-recreate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Containers started successfully${NC}"
else
    echo -e "${RED}✗ Failed to start containers${NC}"
    exit 1
fi

# Step 6: Reload Caddy configuration
echo -e "${BLUE}Step 5: Reloading Caddy configuration...${NC}"
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Caddy configuration reloaded${NC}"
else
    echo -e "${RED}⚠ Warning: Failed to reload Caddy (you may need to restart it manually)${NC}"
fi

# Step 7: Show container status
echo -e "${BLUE}Step 6: Container status:${NC}"
docker compose ps

# Step 8: Show recent logs
echo -e "${BLUE}Step 7: Recent logs (last 20 lines):${NC}"
docker compose logs --tail=20

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Update completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Useful commands:"
echo "  View logs:        docker compose logs -f"
echo "  Restart:          docker compose restart"
echo "  Stop:             docker compose down"
echo "  View app status:  docker compose ps"
echo ""
