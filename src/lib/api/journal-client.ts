/**
 * Journal API Client
 *
 * Client-side helpers for interacting with journal API routes.
 */

export interface JournalEntry {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  mood: number | null;
  wordCount: number;
  tags: string | null;
  promptId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalPrompt {
  id: string;
  prompt: string;
  category: string;
  difficulty: string;
  createdAt: Date;
}

export interface JournalStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number | null;
  totalWords: number;
}

/**
 * Fetch journal entries with optional filters
 */
export async function fetchJournalEntries(params?: {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  mood?: number;
}): Promise<JournalEntry[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  if (params?.startDate) queryParams.set('startDate', params.startDate.toISOString());
  if (params?.endDate) queryParams.set('endDate', params.endDate.toISOString());
  if (params?.mood) queryParams.set('mood', params.mood.toString());

  const response = await fetch(`/api/journal/entries?${queryParams}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    throw new Error(`Failed to fetch entries: ${response.statusText}`);
  }

  const data = await response.json();

  // Convert date strings to Date objects
  return data.entries.map((entry: any) => ({
    ...entry,
    createdAt: new Date(entry.createdAt),
    updatedAt: new Date(entry.updatedAt),
  }));
}

/**
 * Create a new journal entry
 */
export async function createJournalEntry(data: {
  title?: string;
  content: string;
  mood?: number;
  tags?: string[];
}): Promise<JournalEntry> {
  const response = await fetch('/api/journal/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.error || 'Invalid entry data');
    }
    throw new Error(`Failed to create entry: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    ...result.entry,
    createdAt: new Date(result.entry.createdAt),
    updatedAt: new Date(result.entry.updatedAt),
  };
}

/**
 * Update an existing journal entry
 */
export async function updateJournalEntry(
  id: string,
  data: {
    title?: string;
    content?: string;
    mood?: number;
    tags?: string[];
  }
): Promise<JournalEntry> {
  const response = await fetch(`/api/journal/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    if (response.status === 404) {
      throw new Error('Entry not found');
    }
    throw new Error(`Failed to update entry: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    ...result.entry,
    createdAt: new Date(result.entry.createdAt),
    updatedAt: new Date(result.entry.updatedAt),
  };
}

/**
 * Delete a journal entry
 */
export async function deleteJournalEntry(id: string): Promise<void> {
  const response = await fetch(`/api/journal/entries/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    if (response.status === 404) {
      throw new Error('Entry not found');
    }
    throw new Error(`Failed to delete entry: ${response.statusText}`);
  }
}

/**
 * Fetch daily writing prompt
 */
export async function fetchDailyPrompt(): Promise<JournalPrompt> {
  const response = await fetch('/api/journal/prompts?daily=true');

  if (!response.ok) {
    throw new Error(`Failed to fetch daily prompt: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    ...data.prompt,
    createdAt: new Date(data.prompt.createdAt),
  };
}

/**
 * Fetch all journal prompts
 */
export async function fetchAllPrompts(): Promise<JournalPrompt[]> {
  const response = await fetch('/api/journal/prompts');

  if (!response.ok) {
    throw new Error(`Failed to fetch prompts: ${response.statusText}`);
  }

  const data = await response.json();
  return data.prompts.map((prompt: any) => ({
    ...prompt,
    createdAt: new Date(prompt.createdAt),
  }));
}

/**
 * Fetch journal statistics
 */
export async function fetchJournalStats(): Promise<JournalStats> {
  const response = await fetch('/api/journal/stats');

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in');
    }
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  const data = await response.json();
  return data.stats;
}
