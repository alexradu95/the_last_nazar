# AI Agents Feature

## Overview

The AI Agents feature provides three distinct AI companions that interact with users through event-driven messages and chat interfaces:

- **Dawn** ☀️ - The Morning Coach (energetic, motivational)
- **Atlas** 📊 - The Productivity Analyst (analytical, data-driven)
- **Luna** 🌙 - The Journal Companion (reflective, empathetic)

## Status
✅ **Implemented** - Core functionality complete

## Features Implemented

- ✅ Three unique AI agent personalities
- ✅ Event-driven automated messaging
- ✅ Chat interface API endpoints
- ✅ Conversation history storage
- ✅ Suggestions and insights system
- ✅ Context-aware responses
- ✅ Template-based mock AI (ready for real AI integration)
- ✅ React hooks for frontend integration

## Database Schema

### Tables Created

1. **feature_agents_conversations** - User conversations with agents
2. **feature_agents_messages** - Individual messages in conversations
3. **feature_agents_suggestions** - Agent-generated suggestions
4. **feature_agents_insights** - Agent-generated insights

## API Endpoints

All endpoints are implemented and ready to use:

- `POST /api/agents/chat` - Send message to an agent
- `GET /api/agents/conversations` - Get user's conversations
- `GET /api/agents/messages` - Get conversation history
- `GET /api/agents/suggestions` - Get user's suggestions
- `POST /api/agents/suggestions/[id]/dismiss` - Dismiss a suggestion
- `GET /api/agents/insights` - Get user's insights

## Agent Personalities

### Dawn - The Morning Coach
- **Tone**: Energetic, motivational, enthusiastic
- **Color**: Amber (#F59E0B)
- **Triggers**: Login (morning), task completion, level up, streaks

### Atlas - The Productivity Analyst
- **Tone**: Analytical, data-driven, strategic
- **Color**: Blue (#3B82F6)
- **Triggers**: Weekly reviews, pattern detection, task analysis

### Luna - The Journal Companion
- **Tone**: Reflective, empathetic, thoughtful
- **Color**: Purple (#8B5CF6)
- **Triggers**: Journal creation, mood logging, evening prompts

## Events

### Emits
- `agent.message` - When an agent sends a message
- `agent.suggestion` - When an agent creates a suggestion
- `agent.insight` - When an agent generates an insight

### Listens To
- `user.login` - Dawn sends morning briefing (6 AM - 12 PM)
- `task.completed` - Dawn celebrates (30% chance)
- `level.up` - Dawn celebrates achievement
- `streak.milestone` - Dawn recognizes consistency
- `journal.created` - Luna responds (50% chance)
- `mood.logged` - Luna responds empathetically

## Usage

### React Hooks

```typescript
import { useAgent, useSuggestions, useInsights } from '@/features/agents/hooks';

const { messages, sendMessage, isTyping } = useAgent({
  userId: 'user-123',
  agentId: 'dawn',
});
```

### Service Layer

```typescript
import { createAgentService } from '@/features/agents/services';

const agentService = createAgentService(db, eventBus);
await agentService.sendAutomatedMessage('user-123', 'dawn', 'morning_briefing', {});
```

## Next Steps

- [ ] Create UI components (AgentSelector, AgentChat)
- [ ] Add to main app navigation
- [ ] Integrate real AI provider (OpenAI, Anthropic)
- [ ] Add voice mode
- [ ] Implement scheduled insights
- [ ] Add agent avatars and animations

## Testing

Run tests with:
```bash
npm test src/features/agents
```

For detailed documentation, see the inline code comments in each file.
