import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * GamificationPage - Page object for gamification features
 */
export class GamificationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Get current XP value
   */
  async getCurrentXP(): Promise<number> {
    const xpElement = this.page.getByTestId('current-xp');
    const xpText = await this.getText(xpElement);
    return parseInt(xpText.replace(/[^\d]/g, ''), 10) || 0;
  }

  /**
   * Get current level
   */
  async getCurrentLevel(): Promise<number> {
    const levelElement = this.page.getByTestId('current-level');
    const levelText = await this.getText(levelElement);
    return parseInt(levelText.replace(/[^\d]/g, ''), 10) || 1;
  }

  /**
   * Get all unlocked achievements
   */
  async getAchievements(): Promise<string[]> {
    const achievements = this.page.locator('[data-testid="achievement"]');
    const count = await achievements.count();
    const titles: string[] = [];

    for (let i = 0; i < count; i++) {
      const title = await achievements.nth(i).textContent();
      if (title) titles.push(title.trim());
    }

    return titles;
  }

  /**
   * Wait for level up notification
   */
  async waitForLevelUp() {
    const levelUpMessage = this.page.getByText(/level up|leveled up/i);
    await levelUpMessage.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Wait for achievement unlock notification
   */
  async waitForAchievementUnlock(name?: string) {
    if (name) {
      const achievementMessage = this.page.getByText(
        new RegExp(`achievement.*${name}`, 'i')
      );
      await achievementMessage.waitFor({ state: 'visible', timeout: 10000 });
    } else {
      const achievementMessage = this.page.getByText(/achievement unlocked/i);
      await achievementMessage.waitFor({ state: 'visible', timeout: 10000 });
    }
  }

  /**
   * Get current streak
   */
  async getCurrentStreak(): Promise<number> {
    const streakElement = this.page.getByTestId('daily-streak');
    const streakText = await this.getText(streakElement);
    return parseInt(streakText.replace(/[^\d]/g, ''), 10) || 0;
  }

  /**
   * Navigate to gamification/stats page
   */
  async goToStats() {
    await this.goto('/dashboard');
    // Look for stats or gamification link
    const statsLink = this.page.getByRole('link', {
      name: /stats|gamification|progress/i,
    });
    if (await this.elementExists(statsLink)) {
      await statsLink.click();
    }
  }
}
