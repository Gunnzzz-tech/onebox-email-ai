import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { searchEmails, testElasticsearchConnection, esClient } from './elasticsearchClient.js';
import aiRepliesRouter from './ai-replies/api/aiRepliesApi.js';
import { eventBus } from './eventBus.js';
import Imap from 'node-imap';
import { connectIMAP } from './imapClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const connected = await testElasticsearchConnection();
    res.json({ 
      status: 'ok', 
      elasticsearch: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search emails endpoint
app.post('/api/emails/search', async (req, res) => {
  try {
    const { query, account, page = 0, size = 20 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const searchQuery: any = {
      index: 'emails',
      body: {
        query: {
          bool: {
            must: [],
            filter: []
          }
        },
        sort: [{ date: { order: 'desc' } }],
        from: page * size,
        size: size
      }
    };

    // Parse query tokens
    const tokens = query.split(/\s+/);
    
    for (const token of tokens) {
      if (token.startsWith("from:")) {
        searchQuery.body.query.bool.must.push({
          match: { from: token.replace("from:", "").trim() }
        });
      } else if (token.startsWith("to:")) {
        searchQuery.body.query.bool.must.push({
          match: { to: token.replace("to:", "").trim() }
        });
      } else if (token.startsWith("subject:")) {
        searchQuery.body.query.bool.must.push({
          match: { subject: token.replace("subject:", "").trim() }
        });
      } else if (token.startsWith("category:")) {
        searchQuery.body.query.bool.filter.push({
          term: { category: token.replace("category:", "").trim() }
        });
      } else if (token.startsWith("after:")) {
        searchQuery.body.query.bool.filter.push({
          range: { date: { gte: token.replace("after:", "").trim() } }
        });
      } else if (token.startsWith("before:")) {
        searchQuery.body.query.bool.filter.push({
          range: { date: { lte: token.replace("before:", "").trim() } }
        });
      } else if (token.trim().length > 0) {
        searchQuery.body.query.bool.must.push({
          multi_match: {
            query: token,
            fields: ["subject", "text", "from", "to"],
            type: "best_fields",
            fuzziness: "AUTO"
          }
        });
      }
    }

    // Filter by account if specified
    if (account) {
      searchQuery.body.query.bool.filter.push({
        term: { account: account }
      });
    }

    const response = await esClient.search(searchQuery);
    
    const totalHits = typeof response.hits.total === 'object'
      ? (response.hits.total as any).value ?? 0
      : (response.hits.total ?? 0);

    res.json({
      emails: response.hits.hits,
      total: totalHits,
      page,
      size,
      totalPages: Math.ceil(totalHits / size)
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recent emails (for dashboard) - MUST come before /api/emails/:id
app.get('/api/emails/recent', async (req, res) => {
  try {
    const { limit = 10, account, fromDate, toDate } = req.query;
    
    const query: any = {
      index: 'emails',
      body: {
        query: {
          bool: {
            must: [],
            filter: []
          }
        },
        sort: [{ date: { order: 'desc' } }],
        size: parseInt(limit as string)
      }
    };

    // Add account filter if specified
    if (account) {
      query.body.query.bool.filter.push({
        term: { account: account }
      });
    }

    // Add date range filters if specified
    if (fromDate || toDate) {
      const dateRange: any = {};
      if (fromDate) dateRange.gte = fromDate;
      if (toDate) dateRange.lte = toDate;
      
      query.body.query.bool.filter.push({
        range: { date: dateRange }
      });
    }

    // If no filters, use match_all
    if (query.body.query.bool.filter.length === 0 && query.body.query.bool.must.length === 0) {
      query.body.query = { match_all: {} };
    }

    const response = await esClient.search(query);
    
    const totalHits = typeof response.hits.total === 'object'
      ? (response.hits.total as any).value ?? 0
      : (response.hits.total ?? 0);

    res.json({
      emails: response.hits.hits,
      total: totalHits
    });
  } catch (error) {
    console.error('Recent emails error:', error);
    res.status(500).json({ 
      error: 'Failed to get recent emails',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get email statistics
app.get('/api/emails/stats', async (req, res) => {
  try {
    const { account } = req.query;
    
    const query: any = {
      index: 'emails',
      body: {
        size: 0,
        aggs: {
          total_emails: { value_count: { field: 'messageId' } },
          by_category: {
            terms: { field: 'category', size: 10 }
          },
          by_account: {
            terms: { field: 'account', size: 10 }
          },
          by_date: {
            date_histogram: {
              field: 'date',
              calendar_interval: 'day',
              min_doc_count: 1
            }
          }
        }
      }
    };

    if (account) {
      query.body.query = {
        term: { account: account }
      };
    }

    const response = await esClient.search(query);
    
    const aggs: any = response.aggregations ?? {};
    res.json({
      totalEmails: aggs.total_emails?.value ?? 0,
      byCategory: aggs.by_category?.buckets ?? [],
      byAccount: aggs.by_account?.buckets ?? [],
      byDate: aggs.by_date?.buckets ?? []
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get email by ID
app.get('/api/emails/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await esClient.get({
      index: 'emails',
      id: id
    });
    
    res.json(response._source);
  } catch (error) {
    console.error('Get email error:', error);
    res.status(404).json({ 
      error: 'Email not found',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get accounts list
app.get('/api/accounts', async (req, res) => {
  try {
    const response = await esClient.search({
      index: 'emails',
      body: {
        size: 0,
        aggs: {
          accounts: {
            terms: { field: 'account', size: 100 }
          }
        }
      }
    });
    
    const accounts = (response.aggregations as any)?.accounts?.buckets?.map((bucket: any) => ({
      name: bucket.key,
      count: bucket.doc_count
    })) ?? [];
    
    res.json({ accounts });
  } catch (error) {
    console.error('Accounts error:', error);
    res.status(500).json({ 
      error: 'Failed to get accounts',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// AI Replies API routes
app.use('/api/ai-replies', aiRepliesRouter);

// Server-Sent Events endpoint for new emails
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const onNewEmail = (payload: any) => {
    res.write(`event: new-email\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  eventBus.on('new-email', onNewEmail);

  req.on('close', () => {
    eventBus.off('new-email', onNewEmail);
    res.end();
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

export default app;

// Start IMAP monitoring within the same process for SSE events
const emailConfigs: Imap.Config[] = [];

if (process.env.EMAIL_USER_1 && process.env.EMAIL_PASS_1) {
  emailConfigs.push({
    user: process.env.EMAIL_USER_1,
    password: process.env.EMAIL_PASS_1,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
  } as Imap.Config);
}

if (process.env.EMAIL_USER_2 && process.env.EMAIL_PASS_2) {
  emailConfigs.push({
    user: process.env.EMAIL_USER_2,
    password: process.env.EMAIL_PASS_2,
    host: 'imap.outlook.com',
    port: 993,
    tls: true,
  } as Imap.Config);
}

emailConfigs.forEach((config, index) => {
  const label = `Account-${index + 1}`;
  console.log(`📬 Starting IMAP monitor for ${label}`);
  connectIMAP(config, label);
});
