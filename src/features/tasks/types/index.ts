/**
 * Task Feature Types
 */

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  xpReward: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

export interface TaskCompletionResult {
  task: Task;
  xpEarned: number;
  levelUp: boolean;
  achievementsUnlocked: string[];
}

export interface TaskFilters {
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}
