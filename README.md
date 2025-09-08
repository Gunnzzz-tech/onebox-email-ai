# onebox-email-ai
## Project Structure
├── api-server.ts  # Main Express API server

├── connectIMAP.ts       # IMAP account connector

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
