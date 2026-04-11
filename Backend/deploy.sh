#!/bin/bash

# Backend Deployment Script
# This script builds and deploys the backend service using Docker

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"
CONTAINER_NAME="graphix-backend"
IMAGE_NAME="graphix-backend:latest"

echo -e "${YELLOW}[Backend Deploy] Starting deployment...${NC}"

# Check if .env file exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}[Error] .env file not found in Backend directory${NC}"
    echo "Please create Backend/.env file with required environment variables"
    exit 1
fi

# Stop running container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${YELLOW}[Backend Deploy] Stopping existing container...${NC}"
    docker stop "$CONTAINER_NAME" || true
    docker rm "$CONTAINER_NAME" || true
fi

# Build the image
echo -e "${YELLOW}[Backend Deploy] Building Docker image...${NC}"
docker build -t "$IMAGE_NAME" "$BACKEND_DIR"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[Backend Deploy] Image built successfully${NC}"
else
    echo -e "${RED}[Backend Deploy] Failed to build image${NC}"
    exit 1
fi

# Run the container
echo -e "${YELLOW}[Backend Deploy] Starting container...${NC}"
docker run -d \
    --name "$CONTAINER_NAME" \
    -p 127.0.0.1:5000:5000 \
    --env-file "$BACKEND_DIR/.env" \
    -e NODE_ENV=production \
    --restart unless-stopped \
    --health-cmd='wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1' \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    --health-start-period=40s \
    "$IMAGE_NAME"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[Backend Deploy] Container started successfully${NC}"
    echo -e "${GREEN}Backend running on http://127.0.0.1:5000${NC}"
else
    echo -e "${RED}[Backend Deploy] Failed to start container${NC}"
    exit 1
fi

# Wait for container to be healthy
echo -e "${YELLOW}[Backend Deploy] Waiting for service to be healthy...${NC}"
RETRIES=0
MAX_RETRIES=30
while [ $RETRIES -lt $MAX_RETRIES ]; do
    HEALTH_STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "")

    if [ "$HEALTH_STATUS" = "healthy" ]; then
        echo -e "${GREEN}[Backend Deploy] Service is healthy${NC}"
        break
    fi

    RETRIES=$((RETRIES + 1))
    echo -e "${YELLOW}[Backend Deploy] Waiting for service... ($RETRIES/$MAX_RETRIES)${NC}"
    sleep 1
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}[Backend Deploy] Warning: Service health check timeout${NC}"
fi

# Show logs
echo -e "${YELLOW}[Backend Deploy] Recent logs:${NC}"
docker logs "$CONTAINER_NAME" --tail 10

echo -e "${GREEN}[Backend Deploy] Deployment complete!${NC}"
