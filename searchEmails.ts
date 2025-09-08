import { searchEmails, testElasticsearchConnection } from "./elasticsearchClient.js";

async function searchEmailsScript() {
  console.log('🔍 Testing Elasticsearch connection...');
  const connected = await testElasticsearchConnection();
  
  if (!connected) {
    console.error('❌ Cannot connect to Elasticsearch');
    process.exit(1);
  }

  // Search for emails
  const query = process.argv[2] || 'test';
  console.log(`🔎 Searching for: "${query}"`);
  
  try {
    const results = await searchEmails(query);
    
    if (results.length === 0) {
      console.log('📭 No emails found matching your search');
    } else {
      console.log(`📧 Found ${results.length} emails:`);
      results.forEach((hit: any, index: number) => {
        const email = hit._source;
        console.log(`\n${index + 1}. From: ${email.from}`);
        console.log(`   Subject: ${email.subject}`);
        console.log(`   Date: ${email.date}`);
        console.log(`   Account: ${email.account}`);
        console.log(`   Preview: ${email.text?.substring(0, 100)}...`);
      });
    }
  } catch (error) {
    console.error('❌ Search failed:', error);
  }
}

searchEmailsScript();
