import { pipeline } from "@xenova/transformers";
import { vectorStore } from '../vector-db/vectorStore.js';
import { TemplateEngine } from './templateEngine.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ReplySuggestion {
  suggestedReply: string;
  confidence: number;
  template: string;
  context: string;
}

interface EmailContext {
  subject: string;
  body: string;
  from: string;
  to: string;
  category: string;
}

export class RAGEngine {
  private textGenerator: any;
  private templateEngine: TemplateEngine;
  private trainingData: any;

  constructor() {
    this.loadTrainingData();
    this.initializeTextGenerator();
    this.initializeTemplateEngine();
  }

  private async initializeTextGenerator() {
    try {
      // Use a text generation model from Xenova
      this.textGenerator = await pipeline("text-generation", "Xenova/distilgpt2");
      console.log("✅ Text generator initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize text generator:", error);
      this.textGenerator = null;
    }
  }

  private initializeTemplateEngine() {
    const templates = this.trainingData?.outreachTemplates || [];
    this.templateEngine = new TemplateEngine(templates);
  }

  private loadTrainingData() {
    try {
      const trainingDataPath = join(__dirname, '../training-data/product-agenda.json');
      this.trainingData = JSON.parse(readFileSync(trainingDataPath, 'utf-8'));
    } catch (error) {
      console.error('❌ Failed to load training data:', error);
      this.trainingData = null;
    }
  }

  async generateReplySuggestion(emailContext: EmailContext): Promise<ReplySuggestion> {
    try {
      // Step 1: Retrieve relevant context from vector store
      const query = `${emailContext.subject} ${emailContext.body}`;
      const relevantDocs = vectorStore.search(query, 3);
      
      // Step 2: Get the best matching template
      const bestTemplate = this.templateEngine.getBestTemplate(emailContext, relevantDocs);
      
      // Step 3: Generate reply using template-based approach (more reliable than transformers for this use case)
      const suggestedReply = this.templateEngine.generateFallbackReply(emailContext, bestTemplate);
      
      // Step 4: Determine confidence and template used
      const bestMatch = relevantDocs[0];
      const confidence = bestMatch ? bestMatch.similarity : 0.5;
      const template = bestTemplate?.template || 'custom';
      
      return {
        suggestedReply,
        confidence: Math.round(confidence * 100),
        template,
        context: bestTemplate?.context || 'general'
      };
      
    } catch (error) {
      console.error('❌ Error generating reply suggestion:', error);
      return this.getFallbackReply(emailContext);
    }
  }


  private getFallbackReply(emailContext: EmailContext): ReplySuggestion {
    // Fallback reply when LLM is not available
    let reply = "Thank you for your email! ";
    
    if (emailContext.category === "Interested") {
      reply += "I'm excited about this opportunity and would love to discuss it further. ";
    } else if (emailContext.subject.toLowerCase().includes("interview")) {
      reply += "I'm available for an interview and would be happy to schedule a time. ";
    } else if (emailContext.subject.toLowerCase().includes("meeting")) {
      reply += "I'd be happy to schedule a meeting with you. ";
    } else {
      reply += "I appreciate you reaching out. ";
    }
    
    reply += "Please feel free to book a convenient time slot here: https://cal.com/example. Looking forward to our conversation!";
    
    return {
      suggestedReply: reply,
      confidence: 60,
      template: 'fallback',
      context: 'general'
    };
  }

  // Method to add new training data
  addTrainingExample(scenario: string, context: string, template: string, variables: any) {
    if (this.trainingData && this.trainingData.outreachTemplates) {
      this.trainingData.outreachTemplates.push({
        scenario,
        context,
        template,
        variables
      });
      
      // Update vector store
      vectorStore.addDocument({
        id: `template-${Date.now()}`,
        content: `Scenario: ${scenario}. Context: ${context}. Template: ${template}`,
        metadata: { type: 'template', scenario, context, template, variables }
      });
    }
  }

  // Method to get all available templates
  getAvailableTemplates() {
    return this.trainingData?.outreachTemplates || [];
  }
}

// Singleton instance
export const ragEngine = new RAGEngine();
