# Journal Feature

## Overview
A comprehensive journaling system that allows users to write daily entries, track moods, and receive AI-powered insights. The feature supports rich text editing, mood tracking, writing streaks, and provides personalized writing prompts.

## Status
✅ **Implemented** - Fully functional

## Dependencies
- None required (agents feature is optional for AI insights)

## Features Implemented

### Core Functionality
- ✅ Daily journal entry creation and editing
- ✅ Rich text editor with word count
- ✅ Mood tracking and visualization
- ✅ Tag-based organization
- ✅ Privacy controls (public/private entries)
- ✅ Search and filtering
- ✅ Entry statistics and analytics
- ✅ Writing streak tracking
- ✅ Daily writing prompts

### Database Schema
- ✅ `feature_journal_entries` - Store journal entries
- ✅ `feature_journal_prompts` - Writing prompts database
- ✅ `feature_journal_insights` - AI-generated insights (Luna integration ready)

### API Endpoints
- ✅ `GET/POST /api/journal` - CRUD operations for entries
- ✅ `PATCH/DELETE /api/journal?id=xxx` - Update and delete entries
- ✅ `GET /api/journal/stats` - Get journal statistics and streaks
- ✅ `GET /api/journal/prompts` - Get writing prompts
- ✅ `GET/POST /api/journal/mood` - Mood tracking

### UI Components
- ✅ `JournalPage` - Main journal interface
- ✅ `JournalEditor` - Rich text editor with mood selector
- ✅ `JournalList` - Display list of entries
- ✅ `JournalStats` - Statistics dashboard
- ✅ `MoodTracker` - Mood tracking interface

### React Hooks
- ✅ `useJournal` - Journal operations hook
- ✅ `useMoodTracking` - Mood tracking hook

## Events

### Emits
- `journal.created` - When new entry is created (triggers XP gain)
- `journal.updated` - When entry is edited
- `journal.deleted` - When entry is removed
- `mood.logged` - When mood is tracked
- `journal.daily-prompt-ready` - Daily prompt available
- `journal.streak-milestone` - Writing streak milestone reached

### Listens
- `user.login` - Show writing prompt for the day
- `xp.gained` - Respond to gamification events

## Gamification Integration

### XP Rewards
- Base journal entry: **10 XP**
- 50+ words: **+5 XP**
- 100+ words: **+10 XP**
- 250+ words: **+20 XP**
- 500+ words: **+30 XP**
- Writing streak bonus: **5 XP per day**

## Usage

### In Code
```typescript
import { JournalPage } from '@/features/journal/components';
import { useJournal } from '@/features/journal/hooks/useJournal';

// Use in a page
export default function Journal() {
  return <JournalPage userId="user-123" />;
}

// Use the hook
const { entries, createEntry, stats } = useJournal('user-123');
```

### API Usage
```typescript
// Create journal entry
const response = await fetch('/api/journal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    content: 'Today was amazing!',
    mood: 'happy',
    tags: ['personal', 'reflection']
  })
});

// Get statistics
const stats = await fetch('/api/journal/stats?userId=user-123');
```

## Testing

Run tests with:
```bash
npm test src/features/journal/__tests__
```

Tests cover:
- ✅ Journal entry CRUD operations
- ✅ Word count calculation
- ✅ Mood tracking
- ✅ Search functionality
- ✅ Streak calculation
- ✅ Event emission

## Future Enhancements

- [ ] Luna agent integration for personalized insights
- [ ] Auto-save functionality
- [ ] Rich text formatting (markdown)
- [ ] Image uploads
- [ ] Voice-to-text
- [ ] Export to PDF/Markdown
- [ ] Calendar view
- [ ] Offline mode
- [ ] Advanced mood analytics

## Architecture

```
journal/
├── schema/              # Database schema
├── types/               # TypeScript types
├── services/            # Business logic
├── api/                 # API routes
├── components/          # React components
├── hooks/               # React hooks
├── events/              # Event handlers
└── __tests__/           # Tests
```
