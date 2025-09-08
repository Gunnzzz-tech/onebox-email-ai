import { Client } from '@elastic/elasticsearch';
import { categorizeEmail } from "./ai/categorize.js"; // import AI function

// Elasticsearch configuration
const elasticsearchConfig = {
  node: 'http://localhost:9200',
  // No auth needed with xpack.security.enabled=false
};

// Create Elasticsearch client
export const esClient = new Client(elasticsearchConfig);

// Test connection function
export async function testElasticsearchConnection() {
  try {
    const response = await esClient.cluster.health();
    console.log('✅ Elasticsearch connected successfully!');
    console.log('📊 Cluster status:', response.status);
    console.log('🔢 Number of nodes:', response.number_of_nodes);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Elasticsearch:', error);
    return false;
  }
}

// Create index for emails
export async function createEmailIndex() {
  try {
    const indexName = 'emails';
    
    // Check if index exists
    const indexExists = await esClient.indices.exists({ index: indexName });
    
    if (!indexExists) {
      // Create index with mapping
      await esClient.indices.create({
        index: indexName,
        body: {
          mappings: {
            properties: {
              from: { type: 'text' },
              to: { type: 'text' },
              subject: { type: 'text' },
              text: { type: 'text' },
              html: { type: 'text' },
              date: { type: 'date' },
              messageId: { type: 'keyword' },
              account: { type: 'keyword' },
              labels: { type: 'keyword' },
              attachments: {
                type: 'nested',
                properties: {
                  filename: { type: 'text' },
                  contentType: { type: 'keyword' },
                  size: { type: 'long' }
                }
              }
            }
          }
        }
      });
      console.log(`✅ Created index: ${indexName}`);
    } else {
      console.log(`ℹ️ Index ${indexName} already exists`);
    }
  } catch (error) {
    console.error('❌ Failed to create email index:', error);
  }
}

// Index an email document

export async function indexEmail(emailData: any, accountLabel: string) {
  try {
    // 1. Get AI category
    const category = await categorizeEmail(emailData.subject || "", emailData.text || "");

    // 2. Prepare document for Elasticsearch
    const document = {
      from: emailData.from?.text || emailData.from?.value?.[0]?.address || '',
      to: emailData.to?.text || emailData.to?.value?.[0]?.address || '',
      subject: emailData.subject || '',
      text: emailData.text || '',
      html: emailData.html || '',
      date: emailData.date || new Date().toISOString(),
      messageId: emailData.messageId || '',
      account: accountLabel,
      labels: emailData.labels || [],
      attachments: emailData.attachments || [],
      category // 👈 Add AI category here
    };

    // 3. Store in Elasticsearch
    const response = await esClient.index({
      index: 'emails',
      body: document
    });

    console.log(`📧 [${accountLabel}] Email indexed with category: ${category} (ID: ${response._id})`);
    return response._id;

  } catch (error) {
    console.error(`❌ [${accountLabel}] Failed to index email:`, error);
    throw error;
  }
}


// Search emails
export async function searchEmails(query: string, accountLabel?: string) {
  try {
    let searchQuery: any = {
      index: 'emails',
      body: {
        query: {
          bool: {
            must: [],
            filter:[]
          }
        },
        sort: [
          { date: { order: 'desc' } }
        ],
        size: 20
      }
    };
    const tokens=query.split(/\s+/);
    // Handle different query types
    for(const token of tokens){
      if(token.startsWith("from:")){
        searchQuery.body.query.bool.must.push({
          match:{from: token.replace("from:","").trim()}
        });
      }
      else if(token.startsWith("to:")){
        searchQuery.body.query.bool.must.push({
          match:{to: token.replace("to:","").trim()}
        });
      }
      else if(token.startsWith("subject:")){
        searchQuery.body.query.bool.must.push({
          match:{subject:token.replace("subject:","").trim()}
        });
      }
      else if(token.startsWith("after:")){
        searchQuery.body.query.bool.filter.push({
          range:{ date:{ gte: token.replace("after","").trim()}}
        });
      }
      else if(token.startsWith("before:")){
        searchQuery.body.query.bool.fliter.push({
          range: {date: {lte: token.replace("before:","").trim()}}
        });
      }
      else if(token.trim().length>0){
        searchQuery.body.query.bool.must.push({
          multi_match:{
            query:token,
            fields:["subject","text","from","to"],
            type:"best_fields",
            fuzziness:"AUTO"
          }
        });
      }
    }
    // Filter by account if specified
    if (accountLabel) {
      searchQuery.body.query.bool.filter = [
        { term: { account: accountLabel } }
      ];
    }

    const response = await esClient.search(searchQuery);
    return response.hits.hits;
  } catch (error) {
    console.error('❌ Failed to search emails:', error);
    throw error;
  }
}
