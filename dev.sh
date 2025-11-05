#!/bin/bash

# 检查 PostgreSQL 容器是否运行
if ! docker ps | grep -q swarm-postgres; then
  echo "🚀 启动 PostgreSQL 容器..."
  docker start swarm-postgres || {
    echo "❌ 容器不存在，正在创建..."
    docker run -d \
      --name swarm-postgres \
      -e POSTGRES_USER=swarmuser \
      -e POSTGRES_PASSWORD=swarmpass123 \
      -e POSTGRES_DB=swarm_ai_chat \
      -p 5432:5432 \
      postgres:16-alpine
  }
  echo "⏳ 等待数据库启动..."
  sleep 3
fi

echo "✅ PostgreSQL 已就绪"
echo "🚀 启动开发服务器..."

# 加载环境变量并启动开发服务器
export $(cat .env.local | grep -v '^#' | xargs)
pnpm dev
