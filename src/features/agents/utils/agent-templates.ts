/**
 * Agent Personality Templates
 *
 * Contains response templates for Dawn, Atlas, and Luna
 */

import type { AgentId } from '../schema';

export interface AgentContext {
  userId: string;
  recentTasks?: any[];
  recentJournals?: any[];
  gamificationStats?: any;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userPreferences?: any;
  conversationHistory?: any[];
}

export interface AgentPersonality {
  name: string;
  description: string;
  tone: string;
  emoji: string;
  color: string;
}

export const AGENT_PERSONALITIES: Record<AgentId, AgentPersonality> = {
  dawn: {
    name: 'Dawn',
    description: 'Your energetic morning coach',
    tone: 'Energetic, motivational, enthusiastic',
    emoji: '☀️',
    color: '#F59E0B', // Amber
  },
  atlas: {
    name: 'Atlas',
    description: 'Your analytical productivity guide',
    tone: 'Analytical, data-driven, strategic',
    emoji: '📊',
    color: '#3B82F6', // Blue
  },
  luna: {
    name: 'Luna',
    description: 'Your reflective journal companion',
    tone: 'Reflective, empathetic, thoughtful',
    emoji: '🌙',
    color: '#8B5CF6', // Purple
  },
};

// Dawn Templates
export const DAWN_TEMPLATES = {
  morning_briefing: (context: AgentContext) => {
    const hour = new Date().getHours();
    const greeting = hour < 10 ? 'Good morning' : hour < 12 ? 'Morning' : 'Hey there';
    const tasksToday = context.recentTasks?.filter(task => {
      const taskDate = new Date(task.createdAt);
      const today = new Date();
      return taskDate.toDateString() === today.toDateString();
    }).length || 0;

    return `${greeting}! ☀️ ${tasksToday > 0 ? `You have ${tasksToday} tasks for today. Let's make it productive!` : "Ready to crush today's goals?"}`;
  },

  task_completed: (context: any) => {
    const encouragements = [
      "Amazing work! Keep that momentum going! 🚀",
      "You're crushing it today! 💪",
      "Another one done! You're on fire! 🔥",
      "That's the spirit! Keep it up! ⭐",
      "Fantastic! You're making great progress! 🎯",
      "Well done! You're unstoppable! 💫",
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  },

  level_up: (context: any) => {
    const celebrations = [
      `🎉 Level ${context.newLevel}! You're becoming unstoppable!`,
      `Level ${context.newLevel} achieved! 🏆 Your dedication is paying off!`,
      `Wow! Level ${context.newLevel}! 🌟 You're on an incredible journey!`,
      `🎊 Level ${context.newLevel}! Keep this amazing momentum!`,
    ];
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  },

  streak_milestone: (context: any) => {
    return `🔥 ${context.streakDays} day streak! You're building incredible consistency!`;
  },

  default: () => {
    const greetings = [
      "Hey! How can I help boost your productivity today? ☀️",
      "Ready to tackle some goals? I'm here to help! 💪",
      "Let's make today amazing! What's on your mind? 🚀",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  },
};

// Atlas Templates
export const ATLAS_TEMPLATES = {
  weekly_insight: (context: AgentContext) => {
    const completionRate = context.gamificationStats?.completionRate || 0;
    const trend = completionRate > 80 ? 'Excellent consistency!' :
                  completionRate > 60 ? 'Good progress, slight room for improvement.' :
                  'Let\'s work on improving your completion rate.';

    return `Your completion rate this week: ${completionRate.toFixed(1)}%. ${trend}`;
  },

  productivity_pattern: (context: any) => {
    const patterns = [
      `I've noticed you're most productive during ${context.peakHours || 'morning hours'}. Consider scheduling important tasks then.`,
      `Your task completion rate is highest on ${context.bestDays || 'weekdays'}. Plan accordingly.`,
      `You tend to complete smaller tasks more efficiently. Breaking down large tasks might help.`,
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  },

  task_analysis: (context: any) => {
    return `You've completed ${context.completedTasks || 0} tasks this week, ${context.trend > 0 ? 'up' : 'down'} ${Math.abs(context.trend || 0)}% from last week.`;
  },

  default: () => {
    const greetings = [
      "Hello. I'm analyzing your productivity patterns. What would you like to know? 📊",
      "Ready to optimize your workflow? Let's look at the data. 📈",
      "I've been tracking your progress. Need insights? 🎯",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  },
};

// Luna Templates
export const LUNA_TEMPLATES = {
  journal_created: (context: any) => {
    const prompts = [
      "Thank you for sharing. How are you feeling about what you wrote? 🌙",
      "I sense some growth in your writing. What insights did you gain? ✨",
      "Your words have power. What would you like to explore more? 💭",
      "That's a meaningful entry. How does it feel to have expressed that? 🌸",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  },

  evening_prompt: () => {
    const prompts = [
      "What made you smile today? 😊",
      "What challenged you, and what did you learn? 🌱",
      "If today was a chapter, what would its title be? 📖",
      "What are you grateful for this evening? 🙏",
      "How did you grow today, even in small ways? 🌟",
      "What would you like to let go of before tomorrow? 🍃",
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  },

  mood_response: (context: any) => {
    const mood = context.mood || 'neutral';
    const responses: Record<string, string[]> = {
      happy: [
        "It's wonderful to see you feeling good! What's contributing to your happiness? 😊",
        "Your positive energy is beautiful. What's brightening your day? ✨",
      ],
      sad: [
        "I'm here with you. Would you like to talk about what's on your mind? 💙",
        "It's okay to feel this way. Sometimes writing helps. What's weighing on you? 🤗",
      ],
      stressed: [
        "Stress is challenging. What's the main thing causing you stress right now? 🌿",
        "Let's take a breath together. What would help you feel more at ease? 🧘",
      ],
      neutral: [
        "How are you truly feeling beneath the surface? 🌙",
        "Sometimes neutral is just fine. What's on your mind today? 💭",
      ],
    };

    const moodResponses = responses[mood] || responses.neutral;
    return moodResponses[Math.floor(Math.random() * moodResponses.length)];
  },

  default: () => {
    const greetings = [
      "Hello, friend. What's on your heart tonight? 🌙",
      "I'm here to listen. What would you like to reflect on? ✨",
      "Welcome back. Ready to explore your thoughts? 💭",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  },
};

export function getAgentTemplate(
  agentId: AgentId,
  trigger: string,
  context: any
): string {
  switch (agentId) {
    case 'dawn':
      if (trigger in DAWN_TEMPLATES) {
        return (DAWN_TEMPLATES as any)[trigger](context);
      }
      return DAWN_TEMPLATES.default();

    case 'atlas':
      if (trigger in ATLAS_TEMPLATES) {
        return (ATLAS_TEMPLATES as any)[trigger](context);
      }
      return ATLAS_TEMPLATES.default();

    case 'luna':
      if (trigger in LUNA_TEMPLATES) {
        return (LUNA_TEMPLATES as any)[trigger](context);
      }
      return LUNA_TEMPLATES.default();

    default:
      return "Hello! How can I help you today?";
  }
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}
