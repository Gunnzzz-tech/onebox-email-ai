// Template-based reply engine using @xenova/transformers
import { pipeline } from "@xenova/transformers";

interface TemplateMatch {
  template: string;
  confidence: number;
  variables: Record<string, string>;
}

export class TemplateEngine {
  private textGenerator: any;
  private templates: any[] = [];

  constructor(templates: any[]) {
    this.templates = templates;
    this.initializeTextGenerator();
  }

  private async initializeTextGenerator() {
    try {
      // Use a smaller, faster model for template completion
      this.textGenerator = await pipeline("text-generation", "Xenova/distilgpt2");
      console.log("✅ Template engine initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize template engine:", error);
      this.textGenerator = null;
    }
  }

  async generateReply(emailContext: any, bestTemplate: any): Promise<string> {
    try {
      if (!this.textGenerator) {
        return this.generateFallbackReply(emailContext, bestTemplate);
      }

      // Create a more focused prompt for template completion
      const prompt = this.createTemplatePrompt(emailContext, bestTemplate);
      
      const result = await this.textGenerator(prompt, {
        max_length: 150,
        temperature: 0.6,
        do_sample: true,
        pad_token_id: 50256,
        num_return_sequences: 1
      });

      const generatedText = result[0]?.generated_text || '';
      const reply = this.extractReplyFromGeneratedText(generatedText, prompt);
      
      return reply || this.generateFallbackReply(emailContext, bestTemplate);
      
    } catch (error) {
      console.error('❌ Template generation error:', error);
      return this.generateFallbackReply(emailContext, bestTemplate);
    }
  }

  private createTemplatePrompt(emailContext: any, template: any): string {
    const variables = this.extractVariablesFromEmail(emailContext);
    
    return `Complete this professional email reply template:

Template: "${template.template}"
Context: ${template.context}
Email Subject: ${emailContext.subject}
Email From: ${emailContext.from}

Variables to use:
- position: Software Engineer
- opportunity: this opportunity
- topic: the project
- booking_link: https://cal.com/example

Generate a complete, professional reply:`;
  }

  private extractVariablesFromEmail(emailContext: any): Record<string, string> {
    const variables: Record<string, string> = {
      position: "Software Engineer",
      opportunity: "this opportunity", 
      topic: "the project",
      booking_link: "https://cal.com/example"
    };

    // Extract position from subject if it contains job-related keywords
    if (emailContext.subject.toLowerCase().includes('engineer')) {
      variables.position = "Software Engineer";
    } else if (emailContext.subject.toLowerCase().includes('developer')) {
      variables.position = "Developer";
    } else if (emailContext.subject.toLowerCase().includes('manager')) {
      variables.position = "Manager";
    }

    // Extract topic from subject
    if (emailContext.subject.toLowerCase().includes('meeting')) {
      variables.topic = "our meeting";
    } else if (emailContext.subject.toLowerCase().includes('project')) {
      variables.topic = "the project";
    } else if (emailContext.subject.toLowerCase().includes('interview')) {
      variables.topic = "the interview";
    }

    return variables;
  }

  private extractReplyFromGeneratedText(generatedText: string, prompt: string): string {
    const reply = generatedText.replace(prompt, '').trim();
    
    return reply
      .replace(/^Generate a complete, professional reply:\s*/i, '')
      .replace(/\n.*$/s, '')
      .trim();
  }

  generateFallbackReply(emailContext: any, template: any): string {
    const variables = this.extractVariablesFromEmail(emailContext);
    
    // Replace template variables with actual values
    let reply = template.template;
    Object.entries(variables).forEach(([key, value]) => {
      reply = reply.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });

    // Clean up any remaining template variables
    reply = reply.replace(/\{\{[^}]+\}\}/g, 'the opportunity');
    
    return reply;
  }

  // Method to get the best matching template based on email content
  getBestTemplate(emailContext: any, searchResults: any[]): any {
    // First, try to match based on email category and subject keywords
    const category = emailContext.category?.toLowerCase() || '';
    const subject = emailContext.subject?.toLowerCase() || '';
    
    // Smart template selection based on content
    if (subject.includes('interview') || subject.includes('technical')) {
      return this.templates.find(t => t.scenario === 'job_application_response') || this.templates[0];
    }
    
    if (subject.includes('meeting') || subject.includes('call') || subject.includes('schedule')) {
      return this.templates.find(t => t.scenario === 'meeting_request') || this.templates[0];
    }
    
    if (subject.includes('follow') || subject.includes('update') || subject.includes('next step')) {
      return this.templates.find(t => t.scenario === 'follow_up') || this.templates[0];
    }
    
    if (category === 'interested' || subject.includes('opportunity') || subject.includes('position')) {
      return this.templates.find(t => t.scenario === 'interest_confirmation') || this.templates[0];
    }
    
    // Fallback to vector search results
    if (searchResults.length > 0) {
      const bestMatch = searchResults[0];
      const template = this.templates.find(t => 
        t.scenario === bestMatch.document.metadata.scenario
      );
      return template || this.templates[0];
    }

    return this.templates[0]; // Return first template as final fallback
  }
}
