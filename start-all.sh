#!/bin/bash

echo "🚀 Starting OneBox Email Analyzer..."

# Start Elasticsearch
echo "📊 Starting Elasticsearch..."
docker-compose up -d

# Wait for Elasticsearch to be ready
echo "⏳ Waiting for Elasticsearch to be ready..."
sleep 10

# Start API server in background
echo "🔧 Starting API server..."
npm run api &
API_PID=$!

# Wait for API server to start
echo "⏳ Waiting for API server to start..."
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "✅ All services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait

# Cleanup
echo "🛑 Stopping services..."
kill $API_PID $FRONTEND_PID 2>/dev/null
docker-compose down
echo "✅ All services stopped!"

