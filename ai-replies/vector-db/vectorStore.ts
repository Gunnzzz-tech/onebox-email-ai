// Simple in-memory vector store for AI replies
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface VectorDocument {
  id: string;
  content: string;
  metadata: any;
  embedding?: number[];
}

interface SearchResult {
  document: VectorDocument;
  similarity: number;
}

export class SimpleVectorStore {
  private documents: VectorDocument[] = [];
  private embeddings: Map<string, number[]> = new Map();

  constructor() {
    this.loadTrainingData();
  }

  private loadTrainingData() {
    try {
      const trainingDataPath = join(__dirname, '../training-data/product-agenda.json');
      const trainingData = JSON.parse(readFileSync(trainingDataPath, 'utf-8'));
      
      // Convert training data to documents
      this.addDocument({
        id: 'product-info',
        content: `Product: ${trainingData.productInfo.name}. Description: ${trainingData.productInfo.description}. Features: ${trainingData.productInfo.keyFeatures.join(', ')}. Target Audience: ${trainingData.productInfo.targetAudience}`,
        metadata: { type: 'product-info', ...trainingData.productInfo }
      });

      // Add outreach templates
      trainingData.outreachTemplates.forEach((template: any, index: number) => {
        this.addDocument({
          id: `template-${index}`,
          content: `Scenario: ${template.scenario}. Context: ${template.context}. Template: ${template.template}`,
          metadata: { type: 'template', ...template }
        });
      });

      console.log(`✅ Loaded ${this.documents.length} training documents into vector store`);
    } catch (error) {
      console.error('❌ Failed to load training data:', error);
    }
  }

  addDocument(doc: VectorDocument) {
    this.documents.push(doc);
    // Generate simple embedding (in production, use proper embedding model)
    this.embeddings.set(doc.id, this.generateSimpleEmbedding(doc.content));
  }

  private generateSimpleEmbedding(text: string): number[] {
    // Simple bag-of-words embedding for demo purposes
    // In production, use OpenAI embeddings or similar
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(100).fill(0);
    
    words.forEach(word => {
      const hash = this.simpleHash(word) % 100;
      embedding[hash] += 1;
    });
    
    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  search(query: string, limit: number = 3): SearchResult[] {
    const queryEmbedding = this.generateSimpleEmbedding(query);
    const results: SearchResult[] = [];

    this.documents.forEach(doc => {
      const docEmbedding = this.embeddings.get(doc.id);
      if (docEmbedding) {
        const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
        results.push({
          document: doc,
          similarity
        });
      }
    });

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  getDocument(id: string): VectorDocument | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  getAllDocuments(): VectorDocument[] {
    return [...this.documents];
  }
}

// Singleton instance
export const vectorStore = new SimpleVectorStore();
