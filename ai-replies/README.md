# AI-Powered Suggested Replies

This module provides AI-powered reply suggestions for emails using RAG (Retrieval-Augmented Generation) with a vector database.

## 🏗️ Architecture

```
ai-replies/
├── vector-db/           # Vector database implementation
│   └── vectorStore.ts   # Simple in-memory vector store
├── training-data/       # Training data and templates
│   └── product-agenda.json
├── rag-system/          # RAG engine implementation
│   └── ragEngine.ts     # Main RAG engine with LLM integration
├── api/                 # API endpoints
│   └── aiRepliesApi.ts  # Express routes for AI replies
└── test-ai-replies.ts   # Test script
```

## 🚀 Features

- **Vector Database**: Stores product information and outreach templates
- **RAG System**: Retrieves relevant context and generates personalized replies
- **LLM Integration**: Uses OpenAI GPT for intelligent reply generation
- **Template Management**: Manages and suggests appropriate reply templates
- **Confidence Scoring**: Provides confidence levels for suggestions

## 📋 API Endpoints

### Generate Reply Suggestion
```http
POST /api/ai-replies/suggest-reply
Content-Type: application/json

{
  "subject": "Technical Interview Invitation",
  "body": "Hi, Your resume has been shortlisted. When will be a good time for you to attend the technical interview?",
  "from": "hr@company.com",
  "to": "candidate@example.com",
  "category": "Interested"
}
```

**Response:**
```json
{
  "success": true,
  "suggestion": {
    "suggestedReply": "Thank you for shortlisting my profile! I'm available for a technical interview. You can book a slot here: https://cal.com/example",
    "confidence": 85,
    "template": "job_application_response",
    "context": "When responding to job application emails or interview invitations"
  },
  "timestamp": "2025-09-07T20:30:00.000Z"
}
```

### Get Available Templates
```http
GET /api/ai-replies/templates
```

### Search Vector Store
```http
POST /api/ai-replies/search
Content-Type: application/json

{
  "query": "job interview technical",
  "limit": 3
}
```

### Add New Template
```http
POST /api/ai-replies/add-template
Content-Type: application/json

{
  "scenario": "custom_scenario",
  "context": "Custom context description",
  "template": "Custom template with {{variable}}",
  "variables": {
    "variable": "value"
  }
}
```

### Health Check
```http
GET /api/ai-replies/health
```

## 🛠️ Setup

1. **Environment Variables**: Add your OpenAI API key to `.env`:
   ```env
   OPENAI_API_KEY=your-openai-api-key-here
   ```

2. **Install Dependencies**: Already included in main project

3. **Test the System**:
   ```bash
   npm run test:ai-replies
   ```

## 🧪 Testing

Run the test script to see the AI replies in action:

```bash
npx tsx ai-replies/test-ai-replies.ts
```

This will test:
- Vector store search functionality
- AI reply generation for sample emails
- Template management
- Statistics and health checks

## 📊 Example Usage

### Scenario 1: Job Interview Invitation
**Input Email:**
- Subject: "Technical Interview Invitation"
- Body: "Hi, Your resume has been shortlisted. When will be a good time for you to attend the technical interview?"

**AI Suggested Reply:**
> "Thank you for shortlisting my profile! I'm excited about the opportunity to discuss the Software Engineer role. I'm available for a technical interview and you can book a convenient time slot here: https://cal.com/example. Looking forward to our conversation!"

### Scenario 2: Meeting Request
**Input Email:**
- Subject: "Meeting Request - Project Discussion"
- Body: "Hello, I would like to schedule a meeting to discuss the project requirements. Are you available this week?"

**AI Suggested Reply:**
> "I'd be happy to schedule a meeting with you! Please use this link to book a time that works for both of us: https://cal.com/example. Looking forward to our conversation about the project."

## 🔧 Customization

### Adding New Templates
You can add new reply templates by:

1. **Via API**: Use the `/api/ai-replies/add-template` endpoint
2. **Direct File Edit**: Modify `training-data/product-agenda.json`
3. **Programmatically**: Use `ragEngine.addTrainingExample()`

### Modifying Booking Links
Update the booking links in `training-data/product-agenda.json`:
```json
{
  "bookingLinks": {
    "default": "https://cal.com/your-link",
    "interview": "https://cal.com/your-link/interview",
    "meeting": "https://cal.com/your-link/meeting"
  }
}
```

## 🎯 Integration with Email System

The AI replies system integrates seamlessly with the existing email analyzer:

1. **Email Processing**: When emails are categorized as "Interested", the system can automatically generate reply suggestions
2. **Real-time Suggestions**: New emails trigger immediate reply suggestions
3. **Context Awareness**: Uses email content, sender, and category for personalized suggestions

## 🔮 Future Enhancements

- **Persistent Vector Database**: Replace in-memory store with Pinecone or similar
- **Advanced Embeddings**: Use OpenAI embeddings for better similarity matching
- **Learning System**: Learn from user feedback to improve suggestions
- **Multi-language Support**: Support for multiple languages
- **Template Analytics**: Track which templates are most effective
