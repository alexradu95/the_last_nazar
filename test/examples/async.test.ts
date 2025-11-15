/**
 * Example Async Test: API Service
 *
 * Demonstrates:
 * - Testing async operations
 * - Mocking fetch/API calls
 * - Testing error handling
 * - Testing retry logic
 * - Testing timeouts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * API Response types
 */
type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

type User = {
  id: string;
  email: string;
  name: string;
};

/**
 * API Service with retry logic
 */
class ApiService {
  private baseUrl: string;
  private maxRetries: number;

  constructor(baseUrl: string, maxRetries = 3) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
  }

  async fetchUser(userId: string): Promise<ApiResponse<User>> {
    return this.fetchWithRetry<User>(`${this.baseUrl}/users/${userId}`);
  }

  async createUser(userData: Omit<User, 'id'>): Promise<ApiResponse<User>> {
    return this.fetchWithRetry<User>(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  }

  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.fetchWithRetry<User>(`${this.baseUrl}/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return this.fetchWithRetry<void>(`${this.baseUrl}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  private async fetchWithRetry<T>(
    url: string,
    options?: RequestInit,
    attempt = 1
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        // Retry on 5xx errors
        if (response.status >= 500 && attempt < this.maxRetries) {
          await this.delay(this.calculateBackoff(attempt));
          return this.fetchWithRetry<T>(url, options, attempt + 1);
        }

        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Handle empty responses (like DELETE)
      const text = await response.text();
      const data = text ? JSON.parse(text) : undefined;

      return { success: true, data };
    } catch (error) {
      // Retry on network errors
      if (attempt < this.maxRetries) {
        await this.delay(this.calculateBackoff(attempt));
        return this.fetchWithRetry<T>(url, options, attempt + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private calculateBackoff(attempt: number): number {
    return Math.pow(2, attempt) * 100; // Exponential backoff
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

describe('ApiService', () => {
  let apiService: ApiService;
  const baseUrl = 'https://api.example.com';

  beforeEach(() => {
    apiService = new ApiService(baseUrl);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('fetchUser', () => {
    it('should fetch user successfully', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockUser),
      });

      const result = await apiService.fetchUser('user-123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockUser);
      }
      expect(fetch).toHaveBeenCalledWith(
        `${baseUrl}/users/user-123`,
        undefined
      );
    });

    it('should handle 404 error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await apiService.fetchUser('non-existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('HTTP 404: Not Found');
      }
    });

    it('should retry on 500 error and eventually succeed', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify(mockUser),
        });

      const resultPromise = apiService.fetchUser('user-123');

      // Fast-forward timers for retry delays
      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries on persistent 500 error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const resultPromise = apiService.fetchUser('user-123');

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should retry on network error and eventually succeed', async () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      global.fetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify(mockUser),
        });

      const resultPromise = apiService.fetchUser('user-123');

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries on persistent network error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const resultPromise = apiService.fetchUser('user-123');

      await vi.runAllTimersAsync();

      const result = await resultPromise;

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Network error');
      }
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        name: 'New User',
      };

      const createdUser: User = {
        id: 'user-456',
        ...userData,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        text: async () => JSON.stringify(createdUser),
      });

      const result = await apiService.createUser(userData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(createdUser);
      }

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
    });

    it('should handle validation error', async () => {
      const userData = {
        email: 'invalid-email',
        name: 'New User',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const result = await apiService.createUser(userData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('400');
      }
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updates = { name: 'Updated Name' };
      const updatedUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(updatedUser),
      });

      const result = await apiService.updateUser('user-123', updates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Name');
      }

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/users/user-123`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    });

    it('should handle partial updates', async () => {
      const updates = { email: 'updated@example.com' };
      const updatedUser: User = {
        id: 'user-123',
        email: 'updated@example.com',
        name: 'Test User',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(updatedUser),
      });

      const result = await apiService.updateUser('user-123', updates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('updated@example.com');
        expect(result.data.name).toBe('Test User');
      }
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => '',
      });

      const result = await apiService.deleteUser('user-123');

      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/users/user-123`, {
        method: 'DELETE',
      });
    });

    it('should handle user not found error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await apiService.deleteUser('non-existent');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('404');
      }
    });
  });

  describe('Retry Logic', () => {
    it('should use exponential backoff for retries', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ id: '1', email: 'test', name: 'Test' }),
        });

      const resultPromise = apiService.fetchUser('user-123');

      // Check backoff delays: 200ms, 400ms
      await vi.advanceTimersByTimeAsync(200);
      expect(fetch).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(400);
      expect(fetch).toHaveBeenCalledTimes(3);

      const result = await resultPromise;
      expect(result.success).toBe(true);
    });

    it('should not retry on 4xx errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      const result = await apiService.fetchUser('user-123');

      expect(result.success).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('Custom Retry Configuration', () => {
    it('should respect custom max retries', async () => {
      const customApiService = new ApiService(baseUrl, 5);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      const resultPromise = customApiService.fetchUser('user-123');

      await vi.runAllTimersAsync();

      await resultPromise;

      expect(fetch).toHaveBeenCalledTimes(5); // Initial + 4 retries
    });

    it('should work with zero retries', async () => {
      const noRetryService = new ApiService(baseUrl, 1);

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      const result = await noRetryService.fetchUser('user-123');

      expect(result.success).toBe(false);
      expect(fetch).toHaveBeenCalledTimes(1); // No retries
    });
  });
});
