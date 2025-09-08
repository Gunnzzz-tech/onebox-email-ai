# onebox-email-ai
## Project Structure

# ai-replies/    (AI-powered email reply system)

  api/

   -- aiRepliesApi.ts → API layer for generating and fetching AI-based replies.

  rag-system/ (Retrieval-Augmented Generation logic)

   -- ragEngine.ts → Core engine to retrieve relevant data for AI replies.

   -- templateEngine.ts → Applies templates for structuring AI-generated replies.

  src/components/

   -- SuggestedReplyPage.tsx → UI page showing AI-suggested replies.

   -- suggestReply.tsx → Component to display and trigger reply suggestions.

  training-data/

   -- product-agenda.json → Sample training dataset for reply fine-tuning.

  vector-db/

   -- vectorStore.ts → Vector database interface for semantic search in replies.


  README.md → Docs explaining how AI-replies module works.

  test-ai-replies.ts → Tests for validating AI reply generation.

# ai/ (general AI utilities for emails)

   -- categorize.ts → AI logic to classify and categorize emails.

# dist/ (compiled backend code)

   -- imapClient.d.ts → TypeScript type definitions for the IMAP client.
    
   -- imapClient.d.ts.map → Source map for IMAP type definitions.
    
   -- imapClient.js → Compiled JavaScript for handling IMAP connections and fetching emails.
    
   -- imapClient.js.map → Source map for IMAP client JS.
    
   -- index.d.ts → Type definitions for the backend entry point.
    
   -- index.d.ts.map → Source map for backend entry point definitions.
    
   -- index.js → Compiled entry point to start the email processing service.
    
   -- index.js.map → Source map for backend entry point.


# notifications/ (alerting system)

   -- index.js → Main notification manager that routes alerts to Slack/webhooks.
    
   -- slack.js → Sends categorized email notifications to Slack channels.
    
   -- webhook.js → Pushes categorized email data to external webhook endpoints.

# frontend/ (UI for email categorization dashboard)
dist/ (production build output)

   -- assets/index-06cf5f85.css → Compiled & minified CSS bundle for the frontend.
    
   -- assets/index-ff44dc4f.js → Compiled & minified JavaScript bundle.
    
   -- index.html → Production HTML entry point linking to bundled assets.

  # src/ (main frontend application code)
  components/ (reusable UI building blocks)
  
   -- AIReply.tsx → Component for AI-generated email replies.
    
   -- EmailCard.tsx → Displays a single email preview card.
    
   -- EmailList.tsx → Renders a list of email cards.
    
   -- Filters.tsx → UI filters to sort or categorize emails.
    
   -- NotificationCenter.tsx → Shows email or system notifications.
    
   -- SearchBar.tsx → Input bar for searching emails.
    
  pages/ (full pages in the app)
    
   -- Analytics.tsx → Page showing email usage & categorization insights.
    
   -- Home.tsx → Main landing/dashboard page.
    
   -- SearchPage.tsx → Page to search and view filtered email results.
    
   -- SettingsPage.tsx → Page to update app/user settings.
    
  services/
    
   -- api.ts → Handles API requests between frontend and backend.
    
  types/
    
   -- email.ts → TypeScript types/interfaces for email objects.
   
    
  --App.tsx → Main React entry point that wires up routes and components.

Root files-

  --index.html → Development entry point (used by Vite during dev server).
  
  --package.json → Lists frontend dependencies and scripts.
  
  --package-lock.json → Exact dependency versions lockfile for reproducible builds.
  
  --postcss.config.js → Config for PostCSS (CSS transformations).
  
  --tailwind.config.js → TailwindCSS theme and customization settings.
  
  --tsconfig.json → TypeScript compiler options for the frontend.
  
  --tsconfig.node.json → TypeScript config for Node-side tooling (like Vite).
  
  --vite.config.ts → Vite build and dev server configuration.


# backend

  --all the files connecting to main api-server.ts 

├── api-server.ts  # Main Express API server

├── dev-api.js  #Development API server with reduced AI model verbosity

├── connectIMAP.ts       # IMAP account connector

├── imapClient.ts        # Low-level IMAP logic

├── elasticsearchClient.ts # Elasticsearch connection + helpers

├── testEmailConnection.ts #test dataset for email connection

├── testEmailStorage     # sample data fro storing emails

├── testCategorize       # sample data to categorize emails

├── searchEmails.ts      # Email search logic

├── start-all.sh         # Script: start aggregator + API

├── start-services.sh    # Script: start only backend services

├── stop-services.sh     # Script: stop services

├── docker-compose.yml   # Runs Elasticsearch in Docker

├── index.ts             # Main entrypoint (aggregator + services)

├── README.md            # Project guide (this file)

└── .gitignore           # Ignore node_modules, logs, etc.

⚡ Setup & Installation
1. Clone the repo
git clone git@github.com:Gunnzzz-tech/onebox-email-ai.git
cd onebox-email-ai
2. Install dependencies
npm install
3. Setup environment variables
Create a .env file:
EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword
ELASTICSEARCH_URL=http://localhost:9200
PORT=3001
4. Start Elasticsearch (via Docker)
docker-compose up -d
5. Run API server
npm run dev
# OR
npx tsx api-server.ts
The API will run at:
👉 http://localhost:3001/api/health

🔑 Important Endpoints
GET /api/health → Health check.
POST /api/emails/search → Search emails.
GET /api/emails/stats → Email statistics.
GET /api/emails/recent → Recent emails.
GET /api/emails/:id → Email by ID.
POST /api/ai-replies/generate → Generate AI reply.

🧪 Testing
Run test scripts:
npx tsx testEmailConnection.ts
npx tsx testEmailStorage.ts
npx tsx testCategorize.ts


# onebox-email-ai
