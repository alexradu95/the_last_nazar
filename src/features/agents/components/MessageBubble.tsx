/**
 * MessageBubble Component
 *
 * Displays individual chat messages from user or agent
 */

'use client';

import type { Message } from '../schema';
import { AGENT_PERSONALITIES } from '../utils/agent-templates';
import type { AgentId } from '../types';

interface MessageBubbleProps {
  message: Message;
  agentId?: AgentId;
}

export function MessageBubble({ message, agentId }: MessageBubbleProps) {
  const isAgent = message.role === 'agent';
  const agentInfo = agentId ? AGENT_PERSONALITIES[agentId] : null;

  return (
    <div
      className={`flex ${isAgent ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}
    >
      <div
        className={`max-w-[70%] ${
          isAgent
            ? 'bg-gray-100 dark:bg-gray-800'
            : 'bg-blue-500 text-white'
        } rounded-lg px-4 py-2 shadow-sm`}
      >
        {isAgent && agentInfo && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{agentInfo.emoji}</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {agentInfo.name}
            </span>
          </div>
        )}

        <div className={`text-sm ${isAgent ? 'text-gray-900 dark:text-gray-100' : ''}`}>
          {message.content}
        </div>

        <div
          className={`text-xs mt-1 ${
            isAgent
              ? 'text-gray-500 dark:text-gray-400'
              : 'text-blue-100'
          }`}
        >
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }) : ''}
        </div>
      </div>
    </div>
  );
}
