/**
 * AgentInsights Component
 *
 * Display agent-generated insights with categorization
 */

'use client';

import { useInsights } from '../hooks/useInsights';
import { AGENT_PERSONALITIES } from '../utils/agent-templates';
import type { AgentId } from '../types';

interface AgentInsightsProps {
  userId: string;
  category?: string;
  unreadOnly?: boolean;
}

export function AgentInsights({
  userId,
  category,
  unreadOnly = false,
}: AgentInsightsProps) {
  const { insights, loading, error, markAsRead } = useInsights({
    userId,
    category,
    unreadOnly,
    autoLoad: true,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading insights...</div>
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

  if (insights.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-4xl mb-3">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No insights yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Your AI agents will analyze your patterns and provide insights
        </p>
      </div>
    );
  }

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'productivity':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'mood':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'patterns':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'growth':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight) => {
        const agent = AGENT_PERSONALITIES[insight.agentId as AgentId];
        const categoryColor = getCategoryColor(insight.category);

        return (
          <div
            key={insight.id}
            onClick={() => !insight.isRead && markAsRead(insight.id)}
            className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border transition-all duration-200 hover:shadow-md cursor-pointer ${
              insight.isRead
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-blue-500 dark:border-blue-400 shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{agent?.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {agent?.name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${categoryColor}`}>
                      {insight.category}
                    </span>
                  </div>
                </div>
              </div>

              {!insight.isRead && (
                <div className="flex-shrink-0">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                </div>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              {insight.content}
            </p>

            {insight.data && (
              <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 mb-3">
                <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
                  {JSON.stringify(JSON.parse(insight.data), null, 2)}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {insight.createdAt && new Date(insight.createdAt).toLocaleDateString([], {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {!insight.isRead && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  Click to mark as read
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
