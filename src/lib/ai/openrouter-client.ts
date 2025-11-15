/**
 * OpenRouter AI Client
 *
 * Unified AI client using OpenRouter for access to multiple models.
 * Compatible with OpenAI SDK since OpenRouter uses the same API format.
 */

import OpenAI from 'openai';

// Initialize OpenRouter client
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Life OS',
  },
});

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

/**
 * Generate a completion using OpenRouter
 */
export async function generateCompletion(
  messages: AIMessage[],
  options: GenerateOptions = {}
): Promise<string> {
  try {
    const {
      model = process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet',
      maxTokens = 1024,
      temperature = 0.7,
      systemPrompt,
    } = options;

    // Add system message if provided
    const fullMessages: AIMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const response = await openrouter.chat.completions.create({
      model,
      messages: fullMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('[OpenRouter] Generation failed:', error);

    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('OpenRouter API key is invalid or missing');
      }
      if (error.message.includes('429')) {
        throw new Error('OpenRouter rate limit exceeded. Please try again later.');
      }
      if (error.message.includes('insufficient_quota')) {
        throw new Error('OpenRouter account has insufficient credits');
      }
    }

    throw new Error('Failed to generate AI response');
  }
}

/**
 * Stream a completion using OpenRouter (for future use)
 */
export async function streamCompletion(
  messages: AIMessage[],
  options: GenerateOptions = {},
  onChunk?: (text: string) => void
): Promise<string> {
  try {
    const {
      model = process.env.AI_MODEL || 'anthropic/claude-3.5-sonnet',
      maxTokens = 1024,
      temperature = 0.7,
      systemPrompt,
    } = options;

    const fullMessages: AIMessage[] = systemPrompt
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const stream = await openrouter.chat.completions.create({
      model,
      messages: fullMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: maxTokens,
      temperature,
      stream: true,
    });

    let fullText = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullText += content;
        if (onChunk) {
          onChunk(content);
        }
      }
    }

    return fullText;
  } catch (error) {
    console.error('[OpenRouter] Streaming failed:', error);
    throw new Error('Failed to stream AI response');
  }
}

/**
 * Get available models from OpenRouter
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return data.data.map((model: any) => model.id);
  } catch (error) {
    console.error('[OpenRouter] Failed to fetch models:', error);
    return [];
  }
}

/**
 * Test OpenRouter connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const response = await generateCompletion(
      [{ role: 'user', content: 'Hello' }],
      { maxTokens: 10 }
    );
    return !!response;
  } catch (error) {
    console.error('[OpenRouter] Connection test failed:', error);
    return false;
  }
}
