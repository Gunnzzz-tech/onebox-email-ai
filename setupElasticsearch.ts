import { testElasticsearchConnection, createEmailIndex } from "./elasticsearchClient.js";

async function setupElasticsearch() {
  console.log('🔍 Testing Elasticsearch connection...');
  const connected = await testElasticsearchConnection();
  
  if (!connected) {
    console.error('❌ Cannot connect to Elasticsearch');
    process.exit(1);
  }

  console.log('📝 Creating email index...');
  await createEmailIndex();
  
  console.log('✅ Elasticsearch setup complete!');
}

setupElasticsearch();
