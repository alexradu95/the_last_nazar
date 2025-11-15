/**
 * Luna Chat Page
 *
 * Interactive chat interface with Luna AI for journal discussions.
 */

'use client';

import { useState } from 'react';
import { LunaChat } from '@/features/journal/components';

// Mock messages - replace with actual API calls
const initialMessages = [
  {
    id: '1',
    role: 'assistant' as const,
    content: 'Hi! I\'m Luna, your journaling companion. I\'ve noticed you\'ve been journaling consistently this week. How are you feeling today?',
    createdAt: new Date(Date.now() - 300000),
  },
];

export default function LunaChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: message,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add assistant response
    const assistantMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant' as const,
      content: `I understand you're saying "${message}". That's a great reflection! Can you tell me more about how that makes you feel?`,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);

    // Replace with actual API call:
    // const response = await fetch('/api/journal/luna/chat', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message }),
    // });
    // const data = await response.json();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Chat with Luna
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discuss your journal entries and get personalized insights
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
          <LunaChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-400">
            💡 <strong>Tip:</strong> Luna can help you reflect on your journal entries, identify patterns in your mood, and provide personalized writing prompts. Feel free to ask about your journaling journey!
          </p>
        </div>
      </div>
    </div>
  );
}
