# 🚀 How to Run OneBox Email Analyzer

## 📋 **Quick Start (Recommended)**

### **Option 1: One-Command Start**
```bash
./start-services.sh
```

### **Option 2: Manual Start**
```bash
# Terminal 1: Start Elasticsearch
docker-compose up -d

# Terminal 2: Start API Server (with reduced verbosity)
npm run dev-api

# Terminal 3: Start Frontend
cd frontend && npm run dev
```

## 🛑 **Stop All Services**
```bash
./stop-services.sh
```

## 🔧 **Individual Service Commands**

### **Database (Elasticsearch)**
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Check status
curl http://localhost:9200
```

### **Backend API Server**
```bash
# Standard start (verbose AI model output)
npm run api

# Development start (reduced verbosity)
npm run dev-api

# Check health
curl http://localhost:3001/api/health
```

### **Frontend**
```bash
# Start
cd frontend && npm run dev

# Check status
curl http://localhost:3000
```

## 🌐 **Access Points**

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:3001
- **Elasticsearch**: http://localhost:9200
- **API Health**: http://localhost:3001/api/health
- **AI Replies Health**: http://localhost:3001/api/ai-replies/health

## 📊 **Service Status Check**

```bash
# Check all services
curl http://localhost:3001/api/health
curl http://localhost:3000
docker ps

# View logs
tail -f api-server.log
tail -f frontend.log
```

## 🐛 **Troubleshooting**

### **Port Conflicts**
```bash
# Kill existing processes
pkill -f "api-server"
pkill -f "vite"
docker-compose down

# Check what's using ports
lsof -i :3000
lsof -i :3001
lsof -i :9200
```

### **Terminal Getting Stuck**
The AI model initialization produces verbose output. Use:
```bash
# Instead of: npm run api
npm run dev-api  # Reduced verbosity
```

### **Services Not Starting**
```bash
# Check if ports are free
netstat -an | grep LISTEN | grep -E ":(3000|3001|9200)"

# Restart everything
./stop-services.sh
./start-services.sh
```

## 📝 **Development Workflow**

### **Daily Development**
1. Start services: `./start-services.sh`
2. Develop your features
3. Stop services: `./stop-services.sh`

### **Testing AI Replies**
```bash
# Test AI replies endpoint
curl -X POST "http://localhost:3001/api/ai-replies/suggest-reply" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Follow up on your application",
    "body": "Thank you for applying to our Software Engineer position.",
    "from": "recruiter@techcorp.com",
    "to": "applicant@example.com",
    "category": "Interested"
  }'
```

### **Email Data Management**
```bash
# Your emails are already stored in Elasticsearch
# No need to re-fetch unless you want fresh data

# To fetch new emails (optional)
npm start

# To search emails
npm run search
```

## 🎯 **Key Features**

- ✅ **Email Storage**: Already configured and working
- ✅ **AI Categorization**: Automatic email classification
- ✅ **AI Replies**: Smart reply suggestions
- ✅ **Real-time Notifications**: Slack/webhook alerts
- ✅ **Web Interface**: Full React frontend
- ✅ **Search & Analytics**: Advanced email search

## 🔄 **No Re-fetching Needed**

Your emails are already stored in Elasticsearch. The system will:
- ✅ Use existing email data
- ✅ Only fetch new emails when you run `npm start`
- ✅ Provide AI replies for all stored emails
- ✅ Show real-time notifications for new "Interested" emails

## 🎉 **Ready to Use!**

Once services are running:
1. Open http://localhost:3000
2. Browse your emails
3. Click "AI Reply" on any email
4. Get smart reply suggestions!

**Your email analyzer with AI replies is ready!** 🚀
