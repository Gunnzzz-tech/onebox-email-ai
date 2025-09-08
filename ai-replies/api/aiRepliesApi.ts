import express from 'express';
import { ragEngine } from '../rag-system/ragEngine.js';
import { vectorStore } from '../vector-db/vectorStore.js';

const router = express.Router();

// Get AI reply suggestion for an email
router.post('/suggest-reply', async (req, res) => {
  try {
    const { subject, body, from, to, category } = req.body;
    
    if (!subject || !body) {
      return res.status(400).json({ 
        error: 'Subject and body are required' 
      });
    }

    const emailContext = {
      subject,
      body,
      from: from || '',
      to: to || '',
      category: category || 'Unknown'
    };

    const suggestion = await ragEngine.generateReplySuggestion(emailContext);
    
    res.json({
      success: true,
      suggestion,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating reply suggestion:', error);
    res.status(500).json({ 
      error: 'Failed to generate reply suggestion',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AI reply suggestion for an email by ID
router.post('/suggest-reply/:emailId', async (req, res) => {
  try {
    const { emailId } = req.params;
    
    // In a real implementation, you would fetch the email from your database
    // For now, we'll use the emailId to simulate fetching email data
    const emailData = {
      subject: req.body.subject || `Email ${emailId}`,
      body: req.body.body || 'Email content not available',
      from: req.body.from || 'unknown@example.com',
      to: req.body.to || 'user@example.com',
      category: req.body.category || 'Unknown'
    };

    const suggestion = await ragEngine.generateReplySuggestion(emailData);
    
    res.json({
      success: true,
      emailId,
      suggestion,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating reply suggestion for email:', error);
    res.status(500).json({ 
      error: 'Failed to generate reply suggestion',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all available reply templates
router.get('/templates', async (req, res) => {
  try {
    const templates = ragEngine.getAvailableTemplates();
    
    res.json({
      success: true,
      templates,
      count: templates.length
    });
    
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch templates',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add new training example
router.post('/add-template', async (req, res) => {
  try {
    const { scenario, context, template, variables } = req.body;
    
    if (!scenario || !context || !template) {
      return res.status(400).json({ 
        error: 'Scenario, context, and template are required' 
      });
    }

    ragEngine.addTrainingExample(scenario, context, template, variables || {});
    
    res.json({
      success: true,
      message: 'Template added successfully',
      template: { scenario, context, template, variables }
    });
    
  } catch (error) {
    console.error('Error adding template:', error);
    res.status(500).json({ 
      error: 'Failed to add template',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search vector store
router.post('/search', async (req, res) => {
  try {
    const { query, limit = 3 } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    const results = vectorStore.search(query, limit);
    
    res.json({
      success: true,
      query,
      results: results.map(result => ({
        id: result.document.id,
        content: result.document.content,
        metadata: result.document.metadata,
        similarity: Math.round(result.similarity * 100)
      })),
      count: results.length
    });
    
  } catch (error) {
    console.error('Error searching vector store:', error);
    res.status(500).json({ 
      error: 'Failed to search vector store',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get vector store statistics
router.get('/stats', async (req, res) => {
  try {
    const documents = vectorStore.getAllDocuments();
    const stats = {
      totalDocuments: documents.length,
      documentTypes: documents.reduce((acc, doc) => {
        const type = doc.metadata.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Error fetching vector store stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check for AI replies service
router.get('/health', async (req, res) => {
  try {
    const templates = ragEngine.getAvailableTemplates();
    const documents = vectorStore.getAllDocuments();
    
    res.json({
      status: 'healthy',
      service: 'AI Replies',
      templates: templates.length,
      documents: documents.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      service: 'AI Replies',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
