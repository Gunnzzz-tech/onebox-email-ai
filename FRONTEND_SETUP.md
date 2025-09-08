# OneBox Email Analyzer - Frontend Setup Guide

## 🚀 Complete Frontend Implementation

I've created a comprehensive React frontend that integrates with all your backend functionality. Here's what's included:

### ✨ Features Implemented

1. **📊 Dashboard** - Real-time email overview with statistics
2. **🔍 Advanced Search** - Full-text search with filters and pagination
3. **📈 Analytics** - Email categorization, account distribution, and trends
4. **⚙️ Settings** - System status, account management, and configuration
5. **🔔 Notifications** - Real-time alerts for new "Interested" emails
6. **📱 Responsive Design** - Works on desktop, tablet, and mobile

### 🛠️ Backend Integration

- **Express API Server** (`api-server.ts`) - Bridges frontend and Elasticsearch
- **Real-time Email Processing** - AI categorization and notifications
- **Multi-account Support** - Handle multiple email accounts
- **Advanced Search** - Elasticsearch-powered search with filters

## 📦 Setup Instructions

### 1. Install Backend Dependencies

```bash
cd /Users/gungunbali/Downloads/onebox-email
npm install
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start the Services

**Terminal 1 - Start Elasticsearch:**
```bash
docker-compose up -d
```

**Terminal 2 - Start Email Monitor:**
```bash
npm run setup  # Setup Elasticsearch index
npm start      # Start email monitoring
```

**Terminal 3 - Start API Server:**
```bash
npm run api    # Start Express API server (port 3001)
```

**Terminal 4 - Start Frontend:**
```bash
cd frontend
npm run dev    # Start React frontend (port 3000)
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **API Health**: http://localhost:3001/api/health
- **Elasticsearch**: https://localhost:9200

## 🎯 How to Use

### Dashboard
- View email statistics and recent emails
- See AI categorization breakdown
- Monitor system health and account status

### Search
- Use natural language search: "meeting tomorrow"
- Advanced filters: `from:john@example.com`, `subject:invoice`, `category:Interested`
- Filter by account, date range, and categories
- Paginated results with sorting

### Analytics
- Email distribution by category and account
- Daily activity trends
- Performance metrics and insights

### Settings
- Monitor Elasticsearch connection
- View configured email accounts
- Configure notifications and API settings

## 🔧 API Endpoints

The Express server provides these endpoints:

- `GET /api/health` - System health check
- `POST /api/emails/search` - Search emails with filters
- `GET /api/emails/:id` - Get specific email
- `GET /api/emails/stats` - Get email statistics
- `GET /api/emails/recent` - Get recent emails
- `GET /api/accounts` - Get account list

## 🎨 Frontend Architecture

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── EmailCard.tsx   # Individual email display
│   │   ├── EmailList.tsx   # Email list container
│   │   ├── SearchBar.tsx   # Search input with tips
│   │   ├── Filters.tsx     # Filter controls
│   │   └── NotificationCenter.tsx # Real-time notifications
│   ├── pages/              # Main application pages
│   │   ├── Home.tsx        # Dashboard
│   │   ├── SearchPage.tsx  # Search interface
│   │   ├── Analytics.tsx   # Analytics and insights
│   │   └── SettingsPage.tsx # Configuration
│   ├── services/           # API integration
│   │   └── api.ts         # API client functions
│   ├── types/             # TypeScript definitions
│   │   └── email.ts       # Email data types
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
```

## 🔔 Real-time Notifications

The system automatically:
1. Categorizes new emails using AI
2. Sends notifications for "Interested" emails
3. Updates the frontend in real-time
4. Shows notification count in header

## 🎯 Search Capabilities

### Natural Language
- "meeting tomorrow"
- "invoice payment"
- "urgent request"

### Advanced Filters
- `from:john@example.com` - Search by sender
- `to:you@domain.com` - Search by recipient
- `subject:meeting` - Search by subject
- `category:Interested` - Filter by AI category
- `after:2024-01-01` - Date range filtering
- `before:2024-12-31` - Date range filtering

## 🚀 Production Deployment

### Environment Variables
Create `.env` file:
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_USER2=second-email@gmail.com
EMAIL_PASS2=second-app-password
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
GENERIC_WEBHOOK_URL=https://your-webhook-endpoint.com
```

### Build for Production
```bash
# Backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🎉 What You Get

✅ **Complete Email Management** - Monitor, search, and analyze emails
✅ **AI-Powered Categorization** - Automatic email classification
✅ **Real-time Notifications** - Instant alerts for important emails
✅ **Multi-account Support** - Handle multiple email accounts
✅ **Advanced Search** - Powerful search with filters
✅ **Analytics Dashboard** - Insights and trends
✅ **Responsive Design** - Works on all devices
✅ **Modern UI** - Clean, professional interface

Your email analyzer is now a complete, production-ready application! 🎊
