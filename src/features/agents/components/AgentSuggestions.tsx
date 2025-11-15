/**
 * AgentSuggestions Component
 *
 * Display agent-generated suggestions with ability to dismiss
 */

'use client';

import { useSuggestions } from '../hooks/useSuggestions';
import { AGENT_PERSONALITIES } from '../utils/agent-templates';
import type { AgentId } from '../types';

interface AgentSuggestionsProps {
  userId: string;
  status?: 'active' | 'dismissed' | 'completed';
}

export function AgentSuggestions({ userId, status = 'active' }: AgentSuggestionsProps) {
  const { suggestions, loading, error, dismissSuggestion } = useSuggestions({
    userId,
    status,
    autoLoad: true,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading suggestions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-4xl mb-3">💡</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No suggestions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Your AI agents will provide suggestions as you use the app
        </p>
      </div>
    );
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => {
        const agent = AGENT_PERSONALITIES[suggestion.agentId as AgentId];
        const priorityColor = getPriorityColor(suggestion.priority);

        return (
          <div
            key={suggestion.id}
            className={`border-l-4 rounded-lg p-4 shadow-sm transition-all duration-200 hover:shadow-md ${priorityColor}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{agent?.emoji}</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {agent?.name}
                  </span>
                  {suggestion.priority && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      suggestion.priority === 'high'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {suggestion.priority}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                    {suggestion.type}
                  </span>
                </div>

                <p className="text-gray-900 dark:text-gray-100 mb-2">
                  {suggestion.content}
                </p>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {suggestion.createdAt && new Date(suggestion.createdAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {status === 'active' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => dismissSuggestion(suggestion.id)}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
