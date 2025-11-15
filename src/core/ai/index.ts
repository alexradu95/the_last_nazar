/**
 * AI Service
 *
 * Provides a unified interface for AI providers.
 * Supports easy switching between mock and real providers.
 */

import type {
  IAIProvider,
  AIMessage,
  GenerateOptions,
  StreamChunk,
  ProviderType,
} from './types';
import { MockAIProvider, createMockProvider } from './mock-provider';

/**
 * AI Service configuration
 */
export interface AIServiceConfig {
  provider: ProviderType;
  apiKey?: string;
  model?: string;
  useMock?: boolean;
}

/**
 * AI Service class
 */
export class AIService {
  private provider: IAIProvider;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.provider = this.createProvider(config);
  }

  /**
   * Generate text completion
   */
  async generateText(
    messages: AIMessage[],
    options?: GenerateOptions
  ): Promise<string> {
    return this.provider.generateText(messages, options);
  }

  /**
   * Stream text completion
   */
  streamText(
    messages: AIMessage[],
    options?: GenerateOptions
  ): AsyncIterable<StreamChunk> {
    return this.provider.streamText(messages, options);
  }

  /**
   * Create AI provider based on configuration
   */
  private createProvider(config: AIServiceConfig): IAIProvider {
    // Force mock if flag is set
    if (config.useMock || config.provider === 'mock') {
      console.log('[AIService] Using mock provider');
      return new MockAIProvider();
    }

    // Check for API keys
    if (!config.apiKey) {
      console.warn('[AIService] No API key provided, falling back to mock provider');
      return new MockAIProvider();
    }

    // In the future, create real providers here
    switch (config.provider) {
      case 'openai':
        console.warn('[AIService] OpenAI provider not implemented yet, using mock');
        return new MockAIProvider();
      case 'anthropic':
        console.warn('[AIService] Anthropic provider not implemented yet, using mock');
        return new MockAIProvider();
      default:
        return new MockAIProvider();
    }
  }

  /**
   * Switch provider
   */
  switchProvider(config: AIServiceConfig): void {
    this.config = config;
    this.provider = this.createProvider(config);
    console.log(`[AIService] Switched to provider: ${config.provider}`);
  }

  /**
   * Check if using mock provider
   */
  isMock(): boolean {
    return this.provider instanceof MockAIProvider;
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider.name;
  }
}

/**
 * Global AI service instance
 */
let aiService: AIService | null = null;

/**
 * Initialize AI service
 */
export function initializeAIService(config: AIServiceConfig): AIService {
  if (!aiService) {
    aiService = new AIService(config);
  }
  return aiService;
}

/**
 * Get AI service instance
 */
export function getAIService(): AIService {
  if (!aiService) {
    // Default to mock provider
    aiService = new AIService({
      provider: 'mock',
      useMock: true,
    });
  }
  return aiService;
}

/**
 * Helper function to create agent-specific AI service
 */
export function createAgentAI(agentType: string): IAIProvider {
  return createMockProvider(agentType);
}

/**
 * Re-export types
 */
export type * from './types';
export { MockAIProvider, createMockProvider };
