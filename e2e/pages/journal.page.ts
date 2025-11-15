import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Journal Page Object
 * Handles interactions with the journal feature
 */
export class JournalPage extends BasePage {
  // Locators
  private readonly writeTabButton: Locator;
  private readonly entriesTabButton: Locator;
  private readonly titleInput: Locator;
  private readonly contentTextarea: Locator;
  private readonly moodSlider: Locator;
  private readonly saveButton: Locator;
  private readonly entryCards: Locator;
  private readonly statsContainer: Locator;

  constructor(page: Page) {
    super(page);

    // Tab navigation
    this.writeTabButton = page.getByRole('tab', { name: /write/i });
    this.entriesTabButton = page.getByRole('tab', { name: /entries/i });

    // Write tab elements
    this.titleInput = page.getByPlaceholder(/title/i);
    this.contentTextarea = page.getByPlaceholder(/start writing/i);
    this.moodSlider = page.locator('input[type="range"]');
    this.saveButton = page.getByRole('button', { name: /save|publish/i });

    // Entries tab elements
    this.entryCards = page.locator('[data-testid="journal-entry"]');
    this.statsContainer = page.locator('[data-testid="journal-stats"]');
  }

  /**
   * Navigate to journal page
   */
  async navigateToJournal() {
    await this.goto('/journal');
  }

  /**
   * Switch to write tab
   */
  async goToWriteTab() {
    await this.writeTabButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Switch to entries tab
   */
  async goToEntriesTab() {
    await this.entriesTabButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Create a journal entry
   */
  async createEntry(content: string, options?: {
    title?: string;
    mood?: number;
    tags?: string[];
  }) {
    // Make sure we're on the write tab
    await this.goToWriteTab();

    // Fill in title if provided
    if (options?.title) {
      await this.titleInput.fill(options.title);
    }

    // Fill in content (required)
    await this.contentTextarea.fill(content);

    // Set mood if provided (1-5 scale)
    if (options?.mood !== undefined) {
      await this.setMood(options.mood);
    }

    // Click save/publish button
    await this.saveButton.click();

    // Wait for success indicator
    await this.waitForAnyToast();

    // Give time for XP award event to process
    await this.page.waitForTimeout(1000);
  }

  /**
   * Set mood rating (1-5)
   */
  async setMood(mood: number) {
    if (mood < 1 || mood > 5) {
      throw new Error('Mood must be between 1 and 5');
    }

    // Assuming the slider has a min of 1 and max of 5
    await this.moodSlider.fill(mood.toString());
  }

  /**
   * Get count of journal entries
   */
  async getEntryCount(): Promise<number> {
    await this.goToEntriesTab();
    const count = await this.entryCards.count();
    return count;
  }

  /**
   * Get a specific entry by title or index
   */
  async getEntry(titleOrIndex: string | number): Promise<Locator> {
    await this.goToEntriesTab();

    if (typeof titleOrIndex === 'string') {
      return this.page.locator('[data-testid="journal-entry"]', {
        hasText: titleOrIndex,
      });
    }

    return this.entryCards.nth(titleOrIndex);
  }

  /**
   * Check if an entry exists by title
   */
  async entryExists(title: string): Promise<boolean> {
    await this.goToEntriesTab();
    const entry = this.page.locator('[data-testid="journal-entry"]', {
      hasText: title,
    });
    return await this.elementExists(entry);
  }

  /**
   * Delete an entry by title
   */
  async deleteEntry(title: string) {
    await this.goToEntriesTab();

    const entry = await this.getEntry(title);
    const deleteButton = entry.locator('button', { hasText: /delete/i });

    await deleteButton.click();

    // Confirm deletion if there's a dialog
    const confirmButton = this.page.getByRole('button', { name: /confirm|delete/i });
    if (await this.elementExists(confirmButton)) {
      await confirmButton.click();
    }

    await this.waitForAnyToast();
  }

  /**
   * Get journal stats (total entries, streak, etc.)
   */
  async getStats(): Promise<{
    totalEntries: number;
    currentStreak: number;
    totalWords: number;
  }> {
    await this.goToEntriesTab();

    // These selectors would need to match your actual stats display
    const totalEntriesText = await this.page
      .locator('[data-testid="stat-total-entries"]')
      .textContent();
    const streakText = await this.page
      .locator('[data-testid="stat-streak"]')
      .textContent();
    const wordsText = await this.page
      .locator('[data-testid="stat-total-words"]')
      .textContent();

    return {
      totalEntries: parseInt(totalEntriesText || '0', 10),
      currentStreak: parseInt(streakText || '0', 10),
      totalWords: parseInt(wordsText || '0', 10),
    };
  }

  /**
   * Get word count of current entry being written
   */
  async getCurrentWordCount(): Promise<number> {
    const wordCountElement = this.page.locator('[data-testid="word-count"]');
    if (await this.elementExists(wordCountElement)) {
      const text = await wordCountElement.textContent();
      const match = text?.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }
    return 0;
  }

  /**
   * Check if daily prompt is displayed
   */
  async hasDailyPrompt(): Promise<boolean> {
    const promptElement = this.page.locator('[data-testid="daily-prompt"]');
    return await this.elementExists(promptElement);
  }

  /**
   * Get daily prompt text
   */
  async getDailyPrompt(): Promise<string> {
    const promptElement = this.page.locator('[data-testid="daily-prompt"]');
    return await this.getText(promptElement);
  }

  /**
   * Use daily prompt (click to fill content area)
   */
  async useDailyPrompt() {
    const usePromptButton = this.page.getByRole('button', { name: /use prompt/i });
    if (await this.elementExists(usePromptButton)) {
      await usePromptButton.click();
      await this.page.waitForTimeout(500);
    }
  }
}
