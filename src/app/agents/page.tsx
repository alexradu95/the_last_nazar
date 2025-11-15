/**
 * Agents Page
 *
 * Main page for selecting AI agents
 */

import { AgentSelector } from '@/features/agents/components/AgentSelector';

export const metadata = {
  title: 'AI Agents | Your AI Companions',
  description: 'Chat with Dawn, Atlas, and Luna - your personalized AI companions',
};

export default function AgentsPage() {
  return <AgentSelector />;
}
