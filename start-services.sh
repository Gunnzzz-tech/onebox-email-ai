#!/bin/bash

echo "🚀 Starting OneBox Email Analyzer Services..."

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
}

# Start Elasticsearch if not running
if ! check_port 9200; then
    echo "📊 Starting Elasticsearch..."
    docker-compose up -d
    echo "⏳ Waiting for Elasticsearch to be ready..."
    sleep 10
else
    echo "✅ Elasticsearch already running on port 9200"
fi

# Start API server in background with reduced output
if ! check_port 3001; then
    echo "🔧 Starting API server..."
    # Redirect AI model warnings to /dev/null to reduce noise
    npm run api > api-server.log 2>&1 &
    API_PID=$!
    echo "API server PID: $API_PID"
    echo "⏳ Waiting for API server to initialize..."
    sleep 15
else
    echo "✅ API server already running on port 3001"
fi

# Start frontend
if ! check_port 3000; then
    echo "🎨 Starting frontend..."
    cd frontend
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    echo "Frontend PID: $FRONTEND_PID"
    sleep 5
else
    echo "✅ Frontend already running on port 3000"
fi

echo ""
echo "🎉 All services started successfully!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:3001"
echo "📊 Elasticsearch: http://localhost:9200"
echo ""
echo "📋 Service Status:"
echo "   - API Server: http://localhost:3001/api/health"
echo "   - AI Replies: http://localhost:3001/api/ai-replies/health"
echo ""
echo "📝 Logs:"
echo "   - API Server: tail -f api-server.log"
echo "   - Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop all services: ./stop-services.sh"
echo ""

# Save PIDs for cleanup
echo $API_PID > .api_pid
echo $FRONTEND_PID > .frontend_pid
