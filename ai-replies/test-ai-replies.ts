// Test script for AI Replies functionality
import { ragEngine } from './rag-system/ragEngine.js';
import { vectorStore } from './vector-db/vectorStore.js';

async function testAIReplies() {
  console.log('🧪 Testing AI Replies Functionality...\n');

  // Test 1: Vector Store Search
  console.log('1️⃣ Testing Vector Store Search:');
  const searchResults = vectorStore.search('job interview technical', 2);
  console.log('Search results for "job interview technical":');
  searchResults.forEach((result, index) => {
    console.log(`  ${index + 1}. Similarity: ${Math.round(result.similarity * 100)}%`);
    console.log(`     Content: ${result.document.content.substring(0, 100)}...`);
    console.log(`     Type: ${result.document.metadata.type}`);
  });
  console.log('');

  // Test 2: AI Reply Generation
  console.log('2️⃣ Testing AI Reply Generation:');
  
  const testEmails = [
    {
      subject: 'Technical Interview Invitation',
      body: 'Hi, Your resume has been shortlisted. When will be a good time for you to attend the technical interview?',
      from: 'hr@company.com',
      to: 'candidate@example.com',
      category: 'Interested'
    },
    {
      subject: 'Meeting Request - Project Discussion',
      body: 'Hello, I would like to schedule a meeting to discuss the project requirements. Are you available this week?',
      from: 'client@company.com',
      to: 'developer@example.com',
      category: 'Interested'
    },
    {
      subject: 'Follow up on your application',
      body: 'Thank you for applying to our Software Engineer position. We would like to move forward with the next steps.',
      from: 'recruiter@techcorp.com',
      to: 'applicant@example.com',
      category: 'Interested'
    }
  ];

  for (let i = 0; i < testEmails.length; i++) {
    const email = testEmails[i];
    console.log(`\n📧 Test Email ${i + 1}:`);
    console.log(`   Subject: ${email.subject}`);
    console.log(`   From: ${email.from}`);
    console.log(`   Body: ${email.body.substring(0, 80)}...`);
    
    try {
      const suggestion = await ragEngine.generateReplySuggestion(email);
      console.log(`\n🤖 AI Reply Suggestion:`);
      console.log(`   Reply: ${suggestion.suggestedReply}`);
      console.log(`   Confidence: ${suggestion.confidence}%`);
      console.log(`   Template: ${suggestion.template}`);
      console.log(`   Context: ${suggestion.context}`);
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test 3: Vector Store Statistics
  console.log('\n3️⃣ Vector Store Statistics:');
  const documents = vectorStore.getAllDocuments();
  const stats = documents.reduce((acc, doc) => {
    const type = doc.metadata.type || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`   Total Documents: ${documents.length}`);
  console.log(`   Document Types:`, stats);

  // Test 4: Available Templates
  console.log('\n4️⃣ Available Templates:');
  const templates = ragEngine.getAvailableTemplates();
  templates.forEach((template, index) => {
    console.log(`   ${index + 1}. ${template.scenario}`);
    console.log(`      Context: ${template.context}`);
    console.log(`      Template: ${template.template.substring(0, 60)}...`);
  });

  console.log('\n✅ AI Replies testing completed!');
}

// Run the test
testAIReplies().catch(console.error);
