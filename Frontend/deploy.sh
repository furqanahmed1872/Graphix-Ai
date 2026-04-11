#!/bin/bash

# Frontend Deployment Script
# This script builds and deploys the frontend service using Docker

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$FRONTEND_DIR")"
CONTAINER_NAME="graphix-frontend"
IMAGE_NAME="graphix-frontend:latest"

echo -e "${YELLOW}[Frontend Deploy] Starting deployment...${NC}"

# Stop running container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}[Frontend Deploy] Stopping existing container...${NC}"
    docker stop "$CONTAINER_NAME" || true
    docker rm "$CONTAINER_NAME" || true
fi

# Build the image
echo -e "${YELLOW}[Frontend Deploy] Building Docker image...${NC}"
docker build -t "$IMAGE_NAME" "$FRONTEND_DIR"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[Frontend Deploy] Image built successfully${NC}"
else
    echo -e "${RED}[Frontend Deploy] Failed to build image${NC}"
    exit 1
fi

# Run the container
echo -e "${YELLOW}[Frontend Deploy] Starting container...${NC}"
docker run -d \
    --name "$CONTAINER_NAME" \
    -p 127.0.0.1:3000:3000 \
    -e NODE_ENV=production \
    --restart unless-stopped \
    --health-cmd='wget --quiet --tries=1 --spider http://localhost:3000 || exit 1' \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    --health-start-period=40s \
    "$IMAGE_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[Frontend Deploy] Container started successfully${NC}"
    echo -e "${GREEN}Frontend running on http://127.0.0.1:3000${NC}"
else
    echo -e "${RED}[Frontend Deploy] Failed to start container${NC}"
    exit 1
fi

# Wait for container to be healthy
echo -e "${YELLOW}[Frontend Deploy] Waiting for service to be healthy...${NC}"
RETRIES=0
MAX_RETRIES=30
while [ $RETRIES -lt $MAX_RETRIES ]; do
    HEALTH_STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "")

    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo -e "${GREEN}[Frontend Deploy] Service is healthy${NC}"
        break
    fi

    RETRIES=$((RETRIES + 1))
    echo -e "${YELLOW}[Frontend Deploy] Waiting for service... ($RETRIES/$MAX_RETRIES)${NC}"
    sleep 1
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}[Frontend Deploy] Warning: Service health check timeout${NC}"
fi

# Show logs
echo -e "${YELLOW}[Frontend Deploy] Recent logs:${NC}"
docker logs "$CONTAINER_NAME" --tail 10

echo -e "${GREEN}[Frontend Deploy] Deployment complete!${NC}"
