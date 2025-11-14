# Life OS - Component Implementation Guide

## 🎨 Integrating shadcn/ui with Anime.js

This guide shows how to combine shadcn/ui components with Anime.js animations and Vercel AI SDK for the gamified Life OS interface.

---

## 🚀 Project Setup

### Installation
```bash
# Create Next.js 15 project
npx create-next-app@latest life-os --typescript --tailwind --app

# Install shadcn/ui
npx shadcn-ui@latest init

# Install dependencies
npm install animejs @ai-sdk/openai ai drizzle-orm postgres zustand
npm install -D drizzle-kit

# Add shadcn/ui components
npx shadcn-ui@latest add button card dialog toast badge avatar tabs
```

### Configuration
```typescript
// components.json (shadcn/ui config)
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

---

## 🎮 Animated Agent Component

### Dawn Agent with shadcn/ui Card and Anime.js
```tsx
// components/agents/dawn.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Sun, Zap } from 'lucide-react';
import { useChat } from 'ai/react';

export function DawnAgent() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/agents/dawn',
    onFinish: () => {
      // Trigger celebration animation on response
      celebrateResponse();
    }
  });

  useEffect(() => {
    // Entrance animation
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        scale: [0, 1],
        rotate: '1turn',
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutElastic(1, 0.5)',
        complete: () => {
          // Start idle animation
          startIdleAnimation();
        }
      });
    }
  }, []);

  const startIdleAnimation = () => {
    anime({
      targets: '.dawn-glow',
      scale: [1, 1.05, 1],
      opacity: [0.5, 0.8, 0.5],
      duration: 3000,
      easing: 'easeInOutSine',
      loop: true
    });
  };

  const celebrateResponse = () => {
    setIsAnimating(true);
    
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      complete: () => setIsAnimating(false)
    });

    timeline
      .add({
        targets: '.dawn-avatar',
        scale: [1, 1.2, 1],
        duration: 600
      })
      .add({
        targets: '.sparkle-particle',
        translateX: () => anime.random(-50, 50),
        translateY: () => anime.random(-50, 50),
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        duration: 1000,
        delay: anime.stagger(50),
        offset: '-=400'
      });
  };

  return (
    <Card ref={cardRef} className="relative overflow-hidden border-2 border-yellow-400/50 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
      {/* Animated glow effect */}
      <div className="dawn-glow absolute inset-0 bg-gradient-radial from-yellow-400/20 to-transparent pointer-events-none" />
      
      {/* Sparkle particles */}
      {[...Array(6)].map((_, i) => (
        <Sparkles 
          key={i} 
          className="sparkle-particle absolute w-4 h-4 text-yellow-400 opacity-0" 
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%` 
          }} 
        />
      ))}

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="dawn-avatar relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Sun className="w-7 h-7 text-white" />
              </div>
              <Badge className="absolute -top-2 -right-2 bg-green-500">
                Online
              </Badge>
            </div>
            <div>
              <CardTitle className="text-lg">Dawn</CardTitle>
              <p className="text-sm text-muted-foreground">Your Morning Companion 🌅</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Energy: High
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Messages display */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === 'assistant' 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>

          {/* Input form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Good morning! How are you feeling today?"
              className="flex-1 px-3 py-2 rounded-lg border bg-background"
              disabled={isAnimating}
            />
            <Button type="submit" disabled={isAnimating}>
              Send ✨
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🏠 Productivity House with Room Navigation

### Animated Room Cards with shadcn/ui
```tsx
// components/rooms/productivity-house.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import anime from 'animejs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  BookOpen, 
  Heart, 
  Palette, 
  Users, 
  DollarSign 
} from 'lucide-react';

const rooms = [
  { id: 'work', name: 'Work Office', icon: Briefcase, color: 'blue', tasks: 5 },
  { id: 'study', name: 'Study Room', icon: BookOpen, color: 'purple', tasks: 3 },
  { id: 'wellness', name: 'Wellness Garden', icon: Heart, color: 'green', tasks: 2 },
  { id: 'creative', name: 'Creative Studio', icon: Palette, color: 'pink', tasks: 1 },
  { id: 'social', name: 'Social Lounge', icon: Users, color: 'yellow', tasks: 0 },
  { id: 'finance', name: 'Finance Vault', icon: DollarSign, color: 'emerald', tasks: 4 },
];

export function ProductivityHouse() {
  const [selectedRoom, setSelectedRoom] = useState('work');
  const houseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animation for all rooms
    anime({
      targets: '.room-card',
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      delay: anime.stagger(100, { from: 'center' }),
      easing: 'easeOutExpo'
    });
  }, []);

  const handleRoomClick = (roomId: string) => {
    // Animate room selection
    anime({
      targets: `#room-${roomId}`,
      scale: [1, 1.1, 1],
      duration: 400,
      easing: 'easeOutElastic(1, 0.5)'
    });
    
    setSelectedRoom(roomId);
  };

  const handleRoomHover = (e: React.MouseEvent<HTMLDivElement>) => {
    anime({
      targets: e.currentTarget,
      translateY: -5,
      scale: 1.05,
      duration: 300,
      easing: 'easeOutQuad'
    });
  };

  const handleRoomLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    anime({
      targets: e.currentTarget,
      translateY: 0,
      scale: 1,
      duration: 300,
      easing: 'easeOutQuad'
    });
  };

  return (
    <div ref={houseRef} className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🏠 Productivity House
        </h2>
        <p className="text-muted-foreground">Choose a room to focus on different aspects of your life</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const Icon = room.icon;
          const isSelected = selectedRoom === room.id;
          
          return (
            <Card
              key={room.id}
              id={`room-${room.id}`}
              className={`room-card cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleRoomClick(room.id)}
              onMouseEnter={handleRoomHover}
              onMouseLeave={handleRoomLeave}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={`w-8 h-8 text-${room.color}-500`} />
                  {room.tasks > 0 && (
                    <Badge variant="secondary" className="animate-pulse">
                      {room.tasks}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {room.tasks} active tasks
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Room content area */}
      <Tabs value={selectedRoom} className="mt-6">
        <TabsContent value="work">
          <TaskRoom roomName="Work Office" />
        </TabsContent>
        <TabsContent value="study">
          <TaskRoom roomName="Study Room" />
        </TabsContent>
        {/* Add other room contents */}
      </Tabs>
    </div>
  );
}
```

---

## ✅ Task Component with Gamification

### Animated Task Card
```tsx
// components/tasks/task-card.tsx
'use client';

import { useState, useRef } from 'react';
import anime from 'animejs';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Zap, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    priority: 'low' | 'medium' | 'high';
    xpReward: number;
    completed: boolean;
  };
  onComplete: (taskId: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const xpRef = useRef<HTMLDivElement>(null);

  const handleComplete = async () => {
    setIsCompleting(true);
    
    // Task completion animation sequence
    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      complete: () => {
        onComplete(task.id);
      }
    });

    // 1. Card celebration effect
    timeline.add({
      targets: cardRef.current,
      scale: [1, 1.05, 0],
      opacity: [1, 1, 0],
      rotate: '1turn',
      duration: 800
    });

    // 2. XP floating animation
    timeline.add({
      targets: xpRef.current,
      translateY: -100,
      opacity: [1, 0],
      scale: [1, 1.5],
      duration: 1000,
      offset: '-=600'
    }, '-=600');

    // 3. Spawn particles
    spawnCompletionParticles();
  };

  const spawnCompletionParticles = () => {
    const particles = Array.from({ length: 10 }, (_, i) => {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2 bg-yellow-400 rounded-full';
      particle.style.left = '50%';
      particle.style.top = '50%';
      cardRef.current?.appendChild(particle);
      return particle;
    });

    anime({
      targets: particles,
      translateX: () => anime.random(-100, 100),
      translateY: () => anime.random(-100, 100),
      scale: [1, 0],
      opacity: [1, 0],
      duration: 1000,
      easing: 'easeOutCirc',
      complete: () => particles.forEach(p => p.remove())
    });
  };

  const priorityConfig = {
    low: { color: 'blue', icon: Star, xpMultiplier: 1 },
    medium: { color: 'yellow', icon: Zap, xpMultiplier: 1.5 },
    high: { color: 'red', icon: Flame, xpMultiplier: 2 }
  };

  const config = priorityConfig[task.priority];
  const Icon = config.icon;

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "relative overflow-hidden transition-all",
        task.completed && "opacity-50 line-through"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={handleComplete}
            disabled={isCompleting || task.completed}
            className="data-[state=checked]:bg-green-500"
          />
          
          <div className="flex-1">
            <h4 className="font-medium">{task.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={`text-${config.color}-600`}>
                <Icon className="w-3 h-3 mr-1" />
                {task.priority}
              </Badge>
              <Badge variant="secondary">
                <Trophy className="w-3 h-3 mr-1" />
                {task.xpReward} XP
              </Badge>
            </div>
          </div>
        </div>

        {/* XP float element */}
        <div 
          ref={xpRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0"
        >
          <div className="text-2xl font-bold text-yellow-500">
            +{task.xpReward} XP
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🎯 XP Counter with Animation

### Animated XP Progress Bar
```tsx
// components/game/xp-counter.tsx
'use client';

import { useEffect, useRef } from 'react';
import anime from 'animejs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Zap } from 'lucide-react';

interface XPCounterProps {
  currentXP: number;
  targetXP: number;
  level: number;
  nextLevelXP: number;
}

export function XPCounter({ currentXP, targetXP, level, nextLevelXP }: XPCounterProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate XP counter
    anime({
      targets: { value: currentXP },
      value: targetXP,
      duration: 1500,
      easing: 'easeInOutQuad',
      round: 1,
      update: function(anim) {
        if (counterRef.current) {
          const value = Math.floor(anim.animations[0].currentValue);
          counterRef.current.innerHTML = value.toString();
          
          // Trigger milestone effects
          if (value % 100 === 0 && value !== currentXP) {
            milestoneEffect();
          }
        }
      },
      complete: () => {
        if (targetXP >= nextLevelXP) {
          levelUpAnimation();
        }
      }
    });
  }, [targetXP]);

  const milestoneEffect = () => {
    anime({
      targets: progressRef.current,
      scale: [1, 1.05, 1],
      duration: 400,
      easing: 'easeOutElastic(1, 0.5)'
    });
  };

  const levelUpAnimation = () => {
    const timeline = anime.timeline({
      easing: 'easeOutExpo'
    });

    timeline
      .add({
        targets: '.level-badge',
        scale: [1, 1.5, 1],
        rotate: '1turn',
        duration: 1000
      })
      .add({
        targets: '.level-up-text',
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        offset: '-=500'
      });
  };

  const progressPercentage = (targetXP / nextLevelXP) * 100;

  return (
    <div className="space-y-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="level-badge text-lg px-3 py-1">
            <Trophy className="w-4 h-4 mr-1" />
            Level {level}
          </Badge>
          <div className="flex items-center gap-1 text-2xl font-bold">
            <Zap className="w-6 h-6 text-yellow-500" />
            <span ref={counterRef}>{currentXP}</span>
            <span className="text-muted-foreground text-base">/ {nextLevelXP} XP</span>
          </div>
        </div>
        
        <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {Math.round(progressPercentage)}%
        </Badge>
      </div>

      <div ref={progressRef}>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      <div className="level-up-text opacity-0 text-center text-sm text-muted-foreground">
        🎉 Level Up! New features unlocked!
      </div>
    </div>
  );
}
```

---

## 🤖 API Route with Vercel AI SDK

### Dawn Agent API Route
```typescript
// app/api/agents/dawn/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tasks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const { messages, userId } = await req.json();
  
  // Fetch user context
  const userTasks = await db.select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .limit(5);
  
  const systemPrompt = `
    You are Dawn, an energetic and encouraging morning companion in a gamified productivity app.
    Use emoticons and maintain a pixelated game aesthetic.
    
    User's current tasks: ${userTasks.map(t => t.title).join(', ')}
    Time: ${new Date().toLocaleTimeString()}
    
    Be encouraging, suggest priorities, and celebrate achievements!
  `;

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.8,
    maxTokens: 500,
  });

  return result.toAIStreamResponse();
}
```

---

## 🎨 Tailwind Configuration for Pixel Theme

### Extended Tailwind Config
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // Game-specific colors
        xp: {
          gold: '#FFD700',
          silver: '#C0C0C0',
          bronze: '#CD7F32',
        },
        pixel: {
          purple: '#6B46C1',
          blue: '#3B82F6',
          green: '#10B981',
          fire: '#EF4444',
        },
      },
      fontFamily: {
        pixel: ['var(--font-pixel)', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'sparkle': 'sparkle 1s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        sparkle: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [animate],
};

export default config;
```

---

## 🚀 Quick Start Commands

```bash
# Initialize the project
npm create next-app@latest life-os --typescript --tailwind --app
cd life-os

# Install all dependencies
npm install animejs @ai-sdk/openai ai drizzle-orm postgres zustand lucide-react
npm install -D drizzle-kit tailwindcss-animate

# Setup shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button badge dialog toast avatar tabs checkbox progress

# Setup database
npx drizzle-kit generate:pg
npx drizzle-kit push:pg

# Run development server
npm run dev
```

---

## 📂 Recommended File Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── page.tsx          # Home with agents
│   │   ├── tasks/page.tsx    # Task management
│   │   └── journal/page.tsx  # Journaling
│   └── api/
│       └── agents/
│           ├── dawn/route.ts
│           ├── atlas/route.ts
│           └── luna/route.ts
├── components/
│   ├── agents/               # Agent components
│   ├── animations/           # Anime.js wrappers
│   ├── game/                 # XP, achievements
│   ├── rooms/                # Productivity house
│   ├── tasks/                # Task components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── animations/           # Animation presets
│   ├── db/                   # Drizzle setup
│   └── agents/               # Agent logic
└── hooks/
    ├── use-animation.ts
    └── use-game-state.ts
```

---

*This guide provides practical implementation patterns for combining shadcn/ui, Anime.js, and Vercel AI SDK in your Life OS project.*