#!/bin/bash

echo "🛑 Stopping OneBox Email Analyzer Services..."

# Stop API server
if [ -f .api_pid ]; then
    API_PID=$(cat .api_pid)
    if kill -0 $API_PID 2>/dev/null; then
        echo "🔧 Stopping API server (PID: $API_PID)..."
        kill $API_PID
        rm .api_pid
    fi
fi

# Stop frontend
if [ -f .frontend_pid ]; then
    FRONTEND_PID=$(cat .frontend_pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "🎨 Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
        rm .frontend_pid
    fi
fi

# Kill any remaining processes
pkill -f "api-server" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Stop Elasticsearch
echo "📊 Stopping Elasticsearch..."
docker-compose down

echo "✅ All services stopped!"
