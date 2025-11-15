/**
 * Mock AI Provider
 *
 * Simulates AI responses for development without API costs.
 * Provides realistic response times and streaming behavior.
 */

import type {
  IAIProvider,
  AIMessage,
  GenerateOptions,
  StreamChunk,
} from './types';

/**
 * Response templates for different agent personalities
 */
const RESPONSE_TEMPLATES = {
  dawn: [
    "Good morning! ☀️ Let's make today amazing! I see you have {taskCount} tasks on your plate.",
    "Rise and shine! 🌅 You're starting the day strong. How are you feeling?",
    "Hey there! Ready to conquer the day? Let's prioritize what matters most.",
    "Morning vibes! ✨ I can already tell today's going to be productive.",
  ],
  atlas: [
    "Got it! That's a {priority} priority task. I estimate about {time} minutes to complete. ⚔️",
    "Strategic thinking! Let me break this down into manageable steps for you.",
    "Excellent choice. Completing this will earn you {xp} XP and level up your productivity!",
    "Task logged! This fits perfectly into your morning workflow. Let's get it done.",
  ],
  luna: [
    "I sense thoughtfulness in your words... 🌙 What's beneath that feeling?",
    "That's a beautiful insight. Your growth is showing through this reflection.",
    "Take your time with this thought. Sometimes the quieter moments reveal the most.",
    "Your emotional awareness is deepening. What does this mean for you?",
  ],
  general: [
    "I understand. Let me help you with that.",
    "That's a great question! Here's what I think...",
    "I'm here to assist. Let's work through this together.",
    "Absolutely! I can help with that.",
  ],
};

export class MockAIProvider implements IAIProvider {
  name = 'mock';
  private delay = 50; // Simulated delay per token

  constructor(private agentType?: string) {}

  /**
   * Generate text completion
   */
  async generateText(
    messages: AIMessage[],
    options?: GenerateOptions
  ): Promise<string> {
    // Simulate processing time
    await this.simulateDelay(500);

    // Get response template based on agent type or user input
    const response = this.selectResponse(messages);

    // Simulate some variation
    return this.addVariation(response, messages);
  }

  /**
   * Stream text completion
   */
  async *streamText(
    messages: AIMessage[],
    options?: GenerateOptions
  ): AsyncIterable<StreamChunk> {
    const response = await this.generateText(messages, options);
    const words = response.split(' ');

    // Stream word by word
    for (let i = 0; i < words.length; i++) {
      await this.simulateDelay(this.delay);

      const text = (i === 0 ? '' : ' ') + words[i];

      yield {
        type: 'text',
        text,
      };
    }

    // Signal completion
    yield {
      type: 'done',
    };
  }

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean {
    return true; // Mock provider is always ready
  }

  /**
   * Select appropriate response based on context
   */
  private selectResponse(messages: AIMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage?.content?.toLowerCase() || '';

    // Detect agent type from system message or content
    let templates = RESPONSE_TEMPLATES.general;

    if (this.agentType) {
      templates = RESPONSE_TEMPLATES[this.agentType as keyof typeof RESPONSE_TEMPLATES] || templates;
    } else {
      // Auto-detect from content
      if (content.includes('morning') || content.includes('start')) {
        templates = RESPONSE_TEMPLATES.dawn;
      } else if (content.includes('task') || content.includes('complete')) {
        templates = RESPONSE_TEMPLATES.atlas;
      } else if (content.includes('feel') || content.includes('journal')) {
        templates = RESPONSE_TEMPLATES.luna;
      }
    }

    // Random selection
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template;
  }

  /**
   * Add variation to response based on user input
   */
  private addVariation(template: string, messages: AIMessage[]): string {
    let response = template;

    // Replace placeholders with contextual values
    response = response.replace('{taskCount}', String(Math.floor(Math.random() * 5) + 1));
    response = response.replace('{priority}', ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]);
    response = response.replace('{time}', String(Math.floor(Math.random() * 45) + 15));
    response = response.replace('{xp}', String(Math.floor(Math.random() * 50) + 25));

    // Add user context if available
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      // Simple contextual response
      const userWords = lastUserMessage.content.toLowerCase().split(' ');
      if (userWords.includes('help')) {
        response += ' What specifically can I assist with?';
      } else if (userWords.includes('thanks') || userWords.includes('thank')) {
        response = "You're very welcome! Happy to help anytime! 😊";
      }
    }

    return response;
  }

  /**
   * Simulate processing delay
   */
  private async simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Set response delay (for testing)
   */
  setDelay(ms: number): void {
    this.delay = ms;
  }
}

/**
 * Create mock provider for specific agent
 */
export function createMockProvider(agentType?: string): MockAIProvider {
  return new MockAIProvider(agentType);
}
