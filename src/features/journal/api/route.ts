/**
 * Journal API Routes
 *
 * Main CRUD operations for journal entries
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Request validation schemas
const createJournalSchema = z.object({
  userId: z.string(),
  title: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  mood: z.enum(['happy', 'sad', 'stressed', 'excited', 'calm', 'tired', 'angry', 'grateful']).optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  date: z.string().optional(),
});

const updateJournalSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1).optional(),
  mood: z.enum(['happy', 'sad', 'stressed', 'excited', 'calm', 'tired', 'angry', 'grateful']).optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
});

/**
 * GET /api/journal
 * Get user's journal entries with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get service (will be injected by feature system)
    const { createJournalService } = await import('../services/journal-service');
    const db = (global as any).db; // Injected by feature system
    const eventBus = (global as any).eventBus; // Injected by feature system
    const service = createJournalService(db, eventBus);

    // Parse filters
    const filters: any = {};
    if (searchParams.get('mood')) filters.mood = searchParams.get('mood');
    if (searchParams.get('tag')) filters.tag = searchParams.get('tag');
    if (searchParams.get('startDate')) filters.startDate = searchParams.get('startDate');
    if (searchParams.get('endDate')) filters.endDate = searchParams.get('endDate');
    if (searchParams.get('search')) filters.searchQuery = searchParams.get('search');

    const entries = await service.findByUserId(userId, filters);

    return NextResponse.json({
      entries,
      count: entries.length,
    });
  } catch (error) {
    console.error('[Journal API] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/journal
 * Create a new journal entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = createJournalSchema.parse(body);

    // Get service
    const { createJournalService } = await import('../services/journal-service');
    const db = (global as any).db;
    const eventBus = (global as any).eventBus;
    const service = createJournalService(db, eventBus);

    // Create entry
    const result = await service.create(validated);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(
      {
        entry: result.data,
        wordCount: result.data?.wordCount || 0,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    console.error('[Journal API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create journal entry' }, { status: 500 });
  }
}

/**
 * PATCH /api/journal?id=xxx
 * Update a journal entry
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // Validate input
    const validated = updateJournalSchema.parse(body);

    // Get service
    const { createJournalService } = await import('../services/journal-service');
    const db = (global as any).db;
    const eventBus = (global as any).eventBus;
    const service = createJournalService(db, eventBus);

    // Update entry
    const result = await service.update(id, validated);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ entry: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    console.error('[Journal API] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update journal entry' }, { status: 500 });
  }
}

/**
 * DELETE /api/journal?id=xxx
 * Delete a journal entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
    }

    // Get service
    const { createJournalService } = await import('../services/journal-service');
    const db = (global as any).db;
    const eventBus = (global as any).eventBus;
    const service = createJournalService(db, eventBus);

    // Delete entry
    const success = await service.delete(id);

    if (!success) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Journal API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete journal entry' }, { status: 500 });
  }
}
