/**
 * AgentChat Component
 *
 * Chat interface for interacting with an individual AI agent
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgent } from '../hooks/useAgent';
import { MessageBubble } from './MessageBubble';
import { AGENT_PERSONALITIES } from '../utils/agent-templates';
import type { AgentId } from '../types';

interface AgentChatProps {
  agentId: AgentId;
  userId: string;
}

export function AgentChat({ agentId, userId }: AgentChatProps) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, loading, isTyping, error, sendMessage } = useAgent({
    userId,
    agentId,
    autoLoad: true,
  });

  const agent = AGENT_PERSONALITIES[agentId];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const messageContent = input;
    setInput('');
    await sendMessage(messageContent);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
        style={{
          borderTopColor: agent.color,
          borderTopWidth: '4px',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/agents')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-3xl">{agent.emoji}</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {agent.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {agent.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTyping && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              Typing...
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">Loading conversation...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">{agent.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Start a conversation with {agent.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
              {agentId === 'dawn' &&
                "Ask me about your goals for today, or just say hello!"}
              {agentId === 'atlas' &&
                "Ask me for productivity insights or task analysis!"}
              {agentId === 'luna' &&
                "Share your thoughts, or ask for a journal prompt!"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setInput('Hello!')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                👋 Say hello
              </button>
              {agentId === 'dawn' && (
                <button
                  onClick={() => setInput('What should I focus on today?')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  🎯 Daily focus
                </button>
              )}
              {agentId === 'atlas' && (
                <button
                  onClick={() => setInput('How am I doing this week?')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  📊 Weekly stats
                </button>
              )}
              {agentId === 'luna' && (
                <button
                  onClick={() => setInput('Give me a journal prompt')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  ✍️ Journal prompt
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                agentId={agentId}
              />
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mt-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${agent.name}...`}
              disabled={isTyping}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                focusRingColor: agent.color,
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{
                backgroundColor: agent.color,
              }}
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}

export default AgentChat;
