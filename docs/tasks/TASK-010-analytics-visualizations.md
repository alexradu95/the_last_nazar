# TASK-010: Analytics & Visualizations

**Status**: Not Started
**Priority**: Medium
**Dependencies**: TASK-006, TASK-007
**Estimated Effort**: 4-5 hours

---

## Objective

Add visual analytics and charts to help users understand their mood trends, XP progress, writing patterns, and achievement journey.

---

## Current State

- ✅ Data being collected (mood, XP, entries, achievements)
- ✅ Stats calculated in services
- ❌ No visual charts or graphs
- ❌ No trend analysis visualization
- ❌ No historical data views

---

## Requirements

### 1. Mood Trends Chart

**Location**: `/journal` page - Insights tab

Visualizations needed:
- Line chart showing mood over time (last 30 days)
- Average mood calculation
- Mood distribution (how many days at each level)
- Color-coded mood indicators

### 2. XP Progress Chart

**Location**: `/gamification` page

Visualizations needed:
- XP gained over time (last 30 days)
- XP by source breakdown (tasks vs journal vs achievements)
- Level progression timeline
- Projected time to next level

### 3. Writing Frequency Heatmap

**Location**: `/journal` page - Calendar tab

Visualizations needed:
- GitHub-style contribution graph
- Shows days with entries vs. days without
- Color intensity based on word count
- Streak visualization

### 4. Achievement Progress Dashboard

**Location**: `/gamification` page

Visualizations needed:
- Progress bars for in-progress achievements
- Achievement unlock timeline
- Rarity/tier distribution

---

## Implementation Plan

### Step 1: Choose Chart Library

**Recommended: Recharts**
- React-friendly
- Good TypeScript support
- Responsive by default
- Works well with Next.js

```bash
npm install recharts
```

**Alternative: Chart.js with react-chartjs-2**
- More features
- Steeper learning curve

**Alternative: Tremor (Tailwind-based)**
- Beautiful default styling
- Built for dashboards

### Step 2: Create Chart Components

**Create**: `src/components/charts/mood-trend-chart.tsx`

```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MoodData {
  date: string;
  mood: number;
}

interface MoodTrendChartProps {
  data: MoodData[];
}

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  const moodColors = {
    1: '#ef4444', // red-500
    2: '#f97316', // orange-500
    3: '#eab308', // yellow-500
    4: '#84cc16', // lime-500
    5: '#22c55e', // green-500
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const mood = payload[0].value;
      const moodLabels = {
        1: 'Very Sad',
        2: 'Sad',
        3: 'Neutral',
        4: 'Happy',
        5: 'Very Happy',
      };

      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium">{payload[0].payload.date}</p>
          <p className="text-sm" style={{ color: moodColors[mood as keyof typeof moodColors] }}>
            {moodLabels[mood as keyof typeof moodLabels]}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Create**: `src/components/charts/xp-progress-chart.tsx`

```typescript
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface XPData {
  date: string;
  task: number;
  journal: number;
  achievement: number;
}

interface XPProgressChartProps {
  data: XPData[];
}

export function XPProgressChart({ data }: XPProgressChartProps) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Bar dataKey="task" stackId="a" fill="#3b82f6" name="Tasks" />
          <Bar dataKey="journal" stackId="a" fill="#8b5cf6" name="Journal" />
          <Bar dataKey="achievement" stackId="a" fill="#f59e0b" name="Achievements" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

**Create**: `src/components/charts/writing-heatmap.tsx`

```typescript
'use client';

interface HeatmapData {
  date: string;
  count: number;
  wordCount: number;
}

interface WritingHeatmapProps {
  data: HeatmapData[];
}

export function WritingHeatmap({ data }: WritingHeatmapProps) {
  // Get last 12 weeks
  const weeks = 12;
  const daysPerWeek = 7;
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (weeks * daysPerWeek));

  // Generate grid
  const grid: HeatmapData[][] = [];
  for (let week = 0; week < weeks; week++) {
    const weekData: HeatmapData[] = [];
    for (let day = 0; day < daysPerWeek; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (week * daysPerWeek) + day);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = data.find(d => d.date === dateStr) || { date: dateStr, count: 0, wordCount: 0 };
      weekData.push(dayData);
    }
    grid.push(weekData);
  }

  const getColor = (count: number, wordCount: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (wordCount < 100) return 'bg-purple-200 dark:bg-purple-900';
    if (wordCount < 300) return 'bg-purple-400 dark:bg-purple-700';
    if (wordCount < 500) return 'bg-purple-600 dark:bg-purple-500';
    return 'bg-purple-800 dark:bg-purple-400';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-2">
          {dayLabels.map((label, i) => (
            <div key={i} className="h-3 text-xs text-gray-600 dark:text-gray-400 flex items-center">
              {label}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        {grid.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${getColor(day.count, day.wordCount)} hover:ring-2 hover:ring-purple-500 cursor-pointer`}
                title={`${day.date}: ${day.count} ${day.count === 1 ? 'entry' : 'entries'} (${day.wordCount} words)`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm" />
          <div className="w-3 h-3 bg-purple-200 dark:bg-purple-900 rounded-sm" />
          <div className="w-3 h-3 bg-purple-400 dark:bg-purple-700 rounded-sm" />
          <div className="w-3 h-3 bg-purple-600 dark:bg-purple-500 rounded-sm" />
          <div className="w-3 h-3 bg-purple-800 dark:bg-purple-400 rounded-sm" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
```

**Create**: `src/components/charts/achievement-progress.tsx`

```typescript
'use client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  progress?: number;
  maxProgress?: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: Date;
}

interface AchievementProgressProps {
  achievements: Achievement[];
}

export function AchievementProgress({ achievements }: AchievementProgressProps) {
  const inProgress = achievements.filter(a => !a.unlockedAt && a.progress !== undefined);

  const tierColors = {
    bronze: 'bg-orange-600',
    silver: 'bg-gray-400',
    gold: 'bg-yellow-500',
    platinum: 'bg-cyan-400',
  };

  return (
    <div className="space-y-4">
      {inProgress.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No achievements in progress. Complete more tasks to unlock new achievements!
        </p>
      ) : (
        inProgress.map(achievement => {
          const progress = achievement.progress || 0;
          const max = achievement.maxProgress || 100;
          const percentage = (progress / max) * 100;

          return (
            <div key={achievement.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {achievement.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {progress}/{max}
                </span>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${tierColors[achievement.tier]} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
```

### Step 3: Create Analytics API Endpoints

**Create**: `src/app/api/analytics/mood-trend/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { journalEntries } from '@/features/journal/schema';
import { eq, gte, and, isNotNull } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();

  try {
    // Get entries from last 30 days with mood
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, user.id),
          gte(journalEntries.createdAt, thirtyDaysAgo),
          isNotNull(journalEntries.mood)
        )
      )
      .orderBy(journalEntries.createdAt);

    const moodData = entries.map(entry => ({
      date: entry.createdAt.toISOString().split('T')[0],
      mood: entry.mood,
    }));

    return NextResponse.json({ data: moodData });
  } catch (error) {
    console.error('Failed to fetch mood trend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mood trend' },
      { status: 500 }
    );
  }
}
```

**Create**: `src/app/api/analytics/xp-progress/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { xpHistory } from '@/features/gamification/schema';
import { eq, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await db
      .select()
      .from(xpHistory)
      .where(
        and(
          eq(xpHistory.userId, user.id),
          gte(xpHistory.timestamp, thirtyDaysAgo)
        )
      )
      .orderBy(xpHistory.timestamp);

    // Group by date and source
    const grouped = history.reduce((acc, item) => {
      const date = item.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, task: 0, journal: 0, achievement: 0 };
      }
      acc[date][item.source] = (acc[date][item.source] || 0) + item.amount;
      return acc;
    }, {} as Record<string, { date: string; task: number; journal: number; achievement: number }>);

    const data = Object.values(grouped);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Failed to fetch XP progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP progress' },
      { status: 500 }
    );
  }
}
```

**Create**: `src/app/api/analytics/writing-heatmap/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/core/database';
import { getAuthenticatedUser } from '@/features/auth/middleware/authMiddleware';
import { journalEntries } from '@/features/journal/schema';
import { eq, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDatabase();

  try {
    // Get entries from last 12 weeks (84 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 84);

    const entries = await db
      .select({
        date: sql<string>`date(${journalEntries.createdAt})`,
        count: sql<number>`count(*)`,
        wordCount: sql<number>`sum(${journalEntries.wordCount})`,
      })
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, user.id),
          gte(journalEntries.createdAt, startDate)
        )
      )
      .groupBy(sql`date(${journalEntries.createdAt})`);

    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error('Failed to fetch writing heatmap:', error);
    return NextResponse.json(
      { error: 'Failed to fetch writing heatmap' },
      { status: 500 }
    );
  }
}
```

### Step 4: Integrate Charts into Pages

**Update**: `src/app/(app)/gamification/page.tsx`

Add XP Progress chart and Achievement Progress:

```typescript
import { XPProgressChart } from '@/components/charts/xp-progress-chart';
import { AchievementProgress } from '@/components/charts/achievement-progress';

// In the component:
<div className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
  <h2 className="text-xl font-semibold mb-4">XP Progress (Last 30 Days)</h2>
  <XPProgressChart data={xpProgressData} />
</div>

<div className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
  <h2 className="text-xl font-semibold mb-4">Achievement Progress</h2>
  <AchievementProgress achievements={achievements} />
</div>
```

**Update**: `src/app/(app)/journal/page.tsx`

Add Mood Trend chart and Writing Heatmap:

```typescript
import { MoodTrendChart } from '@/components/charts/mood-trend-chart';
import { WritingHeatmap } from '@/components/charts/writing-heatmap';

// In the insights tab:
<div className="space-y-6">
  <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
    <h3 className="text-lg font-semibold mb-4">Mood Trends</h3>
    <MoodTrendChart data={moodData} />
  </div>

  <LunaInsights insights={insights} />
</div>

// In the calendar tab:
<div className="space-y-6">
  <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border">
    <h3 className="text-lg font-semibold mb-4">Writing Activity</h3>
    <WritingHeatmap data={heatmapData} />
  </div>

  <JournalCalendar entries={entries} />
</div>
```

---

## Testing Checklist

- [ ] Mood trend chart displays correctly with real data
- [ ] XP progress chart shows breakdown by source
- [ ] Writing heatmap shows correct activity levels
- [ ] Achievement progress bars update correctly
- [ ] Charts are responsive on mobile devices
- [ ] Dark mode works for all charts
- [ ] Tooltips show detailed information
- [ ] Empty states display when no data
- [ ] Charts perform well with large datasets
- [ ] Colors are accessible (WCAG compliant)

---

## Success Criteria

1. ✅ All charts render correctly with real data
2. ✅ Charts are responsive and mobile-friendly
3. ✅ Dark mode supported
4. ✅ Interactive tooltips provide context
5. ✅ Performance is good (< 100ms render time)
6. ✅ Accessible to screen readers
7. ✅ Empty states handled gracefully

---

## Files to Create/Modify

**Create**:
- `src/components/charts/mood-trend-chart.tsx`
- `src/components/charts/xp-progress-chart.tsx`
- `src/components/charts/writing-heatmap.tsx`
- `src/components/charts/achievement-progress.tsx`
- `src/app/api/analytics/mood-trend/route.ts`
- `src/app/api/analytics/xp-progress/route.ts`
- `src/app/api/analytics/writing-heatmap/route.ts`

**Modify**:
- `src/app/(app)/gamification/page.tsx` - Add charts
- `src/app/(app)/journal/page.tsx` - Add charts

---

## Notes

- Recharts is client-side only - components need 'use client'
- Consider caching analytics data for performance
- May want to add date range selector later
- Could add export to CSV/PDF functionality
- Consider adding comparative views (this week vs last week)
