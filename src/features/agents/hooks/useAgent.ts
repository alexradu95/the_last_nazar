/**
 * useAgent Hook
 *
 * React hook for interacting with AI agents
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AgentId, Conversation, Message } from '../schema';

interface UseAgentOptions {
  userId: string;
  agentId: AgentId;
  autoLoad?: boolean;
}

interface UseAgentReturn {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  isTyping: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadHistory: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAgent({
  userId,
  agentId,
  autoLoad = true,
}: UseAgentOptions): UseAgentReturn {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!conversation?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/agents/messages?conversationId=${conversation.id}`
      );

      if (!response.ok) {
        throw new Error('Failed to load message history');
      }

      const data = await response.json();
      setMessages(data.messages.reverse()); // Reverse to show oldest first
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      console.error('Error loading message history:', err);
    } finally {
      setLoading(false);
    }
  }, [conversation?.id]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      try {
        setIsTyping(true);
        setError(null);

        const response = await fetch('/api/agents/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            agentId,
            message: content,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        // Update conversation if it's the first message
        if (!conversation) {
          setConversation({
            id: data.conversationId,
            userId,
            agentId,
            title: null,
            lastMessageAt: new Date(),
            createdAt: new Date(),
          });
        }

        // Reload history to get both user and agent messages
        await loadHistory();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        console.error('Error sending message:', err);
      } finally {
        setIsTyping(false);
      }
    },
    [userId, agentId, conversation, loadHistory]
  );

  const refresh = useCallback(async () => {
    await loadHistory();
  }, [loadHistory]);

  // Load conversation and initial messages
  useEffect(() => {
    if (!autoLoad || !userId || !agentId) return;

    const loadConversation = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/agents/conversations?userId=${userId}&agentId=${agentId}`
        );

        if (!response.ok) {
          throw new Error('Failed to load conversation');
        }

        const data = await response.json();
        if (data.conversations.length > 0) {
          setConversation(data.conversations[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load conversation'
        );
        console.error('Error loading conversation:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [userId, agentId, autoLoad]);

  // Load messages when conversation is available
  useEffect(() => {
    if (conversation) {
      loadHistory();
    }
  }, [conversation, loadHistory]);

  return {
    conversation,
    messages,
    loading,
    isTyping,
    error,
    sendMessage,
    loadHistory,
    refresh,
  };
}
