/**
 * Individual Agent Chat Page
 *
 * Dynamic route for chatting with a specific agent
 */

import { AgentChat } from '@/features/agents/components/AgentChat';
import type { AgentId } from '@/features/agents/types';

interface AgentPageProps {
  params: {
    agentId: string;
  };
}

export async function generateMetadata({ params }: AgentPageProps) {
  const { agentId } = await params;
  const agentNames: Record<string, string> = {
    dawn: 'Dawn - Morning Coach',
    atlas: 'Atlas - Productivity Analyst',
    luna: 'Luna - Journal Companion',
  };

  return {
    title: `${agentNames[agentId] || 'Agent'} | AI Agents`,
    description: `Chat with ${agentNames[agentId] || 'your AI agent'}`,
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { agentId } = await params;

  // Validate agent ID
  const validAgents: AgentId[] = ['dawn', 'atlas', 'luna'];
  if (!validAgents.includes(agentId as AgentId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Agent not found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The agent &quot;{agentId}&quot; does not exist.
          </p>
          <a
            href="/agents"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to agents
          </a>
        </div>
      </div>
    );
  }

  // TODO: Get actual user ID from session/auth
  const userId = 'demo-user-1';

  return <AgentChat agentId={agentId as AgentId} userId={userId} />;
}
