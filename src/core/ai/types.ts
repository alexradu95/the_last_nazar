/**
 * AI Provider Types
 *
 * Common types for AI provider abstraction.
 */

/**
 * AI message role
 */
export type MessageRole = 'system' | 'user' | 'assistant';

/**
 * AI message structure
 */
export interface AIMessage {
  role: MessageRole;
  content: string;
}

/**
 * Streaming chunk
 */
export interface StreamChunk {
  type: 'text' | 'data' | 'error' | 'done';
  text?: string;
  data?: any;
  error?: Error;
}

/**
 * AI provider configuration
 */
export interface AIProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * AI provider interface
 */
export interface IAIProvider {
  /**
   * Provider name
   */
  name: string;

  /**
   * Generate text completion
   */
  generateText(
    messages: AIMessage[],
    options?: GenerateOptions
  ): Promise<string>;

  /**
   * Stream text completion
   */
  streamText(
    messages: AIMessage[],
    options?: GenerateOptions
  ): AsyncIterable<StreamChunk>;

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean;
}

/**
 * Generation options
 */
export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

/**
 * Provider type
 */
export type ProviderType = 'openai' | 'anthropic' | 'mock';
