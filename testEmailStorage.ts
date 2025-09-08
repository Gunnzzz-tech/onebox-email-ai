import { indexEmail, testElasticsearchConnection, searchEmails } from "./elasticsearchClient.js";

// Sample email data for testing
const sampleEmails = [
  {
    from: { text: "john.doe@example.com" },
    to: { text: "you@yourdomain.com" },
    subject: "Meeting Tomorrow",
    text: "Hi, let's meet tomorrow at 2 PM to discuss the project. Please bring your notes.",
    html: "<p>Hi, let's meet tomorrow at 2 PM to discuss the project. Please bring your notes.</p>",
    date: new Date("2024-01-15T10:30:00Z"),
    messageId: "msg-001@example.com",
    attachments: [
      {
        filename: "agenda.pdf",
        contentType: "application/pdf",
        size: 1024000
      }
    ]
  },
  {
    from: { text: "sarah.smith@company.com" },
    to: { text: "you@yourdomain.com" },
    subject: "Invoice #12345",
    text: "Please find attached the invoice for services rendered. Payment is due within 30 days.",
    html: "<p>Please find attached the invoice for services rendered. Payment is due within 30 days.</p>",
    date: new Date("2024-01-14T14:20:00Z"),
    messageId: "msg-002@company.com",
    attachments: [
      {
        filename: "invoice-12345.pdf",
        contentType: "application/pdf",
        size: 256000
      }
    ]
  },
  {
    from: { text: "newsletter@technews.com" },
    to: { text: "you@yourdomain.com" },
    subject: "Weekly Tech News - AI Breakthrough",
    text: "This week in tech: New AI model breaks records, quantum computing advances, and more exciting developments in the tech world.",
    html: "<p>This week in tech: New AI model breaks records, quantum computing advances, and more exciting developments in the tech world.</p>",
    date: new Date("2024-01-13T09:00:00Z"),
    messageId: "msg-003@technews.com",
    attachments: []
  }
];

async function testEmailStorage() {
  console.log('🔍 Testing Elasticsearch connection...');
  const connected = await testElasticsearchConnection();
  
  if (!connected) {
    console.error('❌ Cannot connect to Elasticsearch');
    process.exit(1);
  }

  console.log('📧 Adding sample emails to Elasticsearch...\n');

  // Index sample emails
  for (let i = 0; i < sampleEmails.length; i++) {
    const email = sampleEmails[i];
    try {
      const docId = await indexEmail(email, `Test-Account-${i + 1}`);
      console.log(`✅ Email ${i + 1} indexed with ID: ${docId}`);
    } catch (error) {
      console.error(`❌ Failed to index email ${i + 1}:`, error);
    }
  }

  console.log('\n🔎 Testing search functionality...\n');

  // Test different search queries
  const searchQueries = [
    "meeting",
    "invoice",
    "AI",
    "from:john.doe@example.com",
    "subject:newsletter"
  ];

  for (const query of searchQueries) {
    console.log(`🔍 Searching for: "${query}"`);
    try {
      const results = await searchEmails(query);
      console.log(`   Found ${results.length} emails:`);
      
      results.forEach((hit: any, index: number) => {
        const email = hit._source;
        console.log(`   ${index + 1}. ${email.subject} (from: ${email.from})`);
      });
      console.log('');
    } catch (error) {
      console.error(`   ❌ Search failed:`, error);
    }
  }

  console.log('✅ Email storage test completed!');
}

testEmailStorage();
