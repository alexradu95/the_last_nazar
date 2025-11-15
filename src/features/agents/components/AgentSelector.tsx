/**
 * AgentSelector Component
 *
 * Main page for selecting which AI agent to interact with
 */

'use client';

import { useRouter } from 'next/navigation';
import { AGENT_PERSONALITIES } from '../utils/agent-templates';
import type { AgentId } from '../types';

const agents: AgentId[] = ['dawn', 'atlas', 'luna'];

export function AgentSelector() {
  const router = useRouter();

  const handleSelectAgent = (agentId: AgentId) => {
    router.push(`/agents/${agentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Meet Your AI Companions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose an agent to start a conversation or get personalized insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agentId) => {
            const agent = AGENT_PERSONALITIES[agentId];

            return (
              <div
                key={agentId}
                onClick={() => handleSelectAgent(agentId)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{
                  borderTop: `4px solid ${agent.color}`,
                }}
              >
                <div className="text-center mb-4">
                  <div className="text-6xl mb-3">{agent.emoji}</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {agent.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {agent.description}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-semibold">Tone:</span> {agent.tone}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {agentId === 'dawn' && (
                      <>
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded-full">
                          Morning Briefings
                        </span>
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs rounded-full">
                          Motivation
                        </span>
                      </>
                    )}

                    {agentId === 'atlas' && (
                      <>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          Analytics
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          Insights
                        </span>
                      </>
                    )}

                    {agentId === 'luna' && (
                      <>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                          Reflection
                        </span>
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                          Journaling
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  className="mt-6 w-full py-2 px-4 rounded-lg font-medium text-white transition-colors"
                  style={{
                    backgroundColor: agent.color,
                  }}
                >
                  Start Conversation
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            💡 How it works
          </h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• Each agent has a unique personality and specialization</li>
            <li>• Agents automatically respond to your activities</li>
            <li>• Start a chat anytime for personalized guidance</li>
            <li>• Receive insights and suggestions based on your patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AgentSelector;
