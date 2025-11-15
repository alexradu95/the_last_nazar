/**
 * Task Filters Component
 *
 * Sidebar filters for tasks
 */

'use client';

import type { TaskCategory } from '../schema';
import type { TaskFilters as TaskFiltersType } from '../services/task-service';

export interface TaskFiltersProps {
  filters: TaskFiltersType;
  categories: TaskCategory[];
  onFiltersChange: (filters: TaskFiltersType) => void;
}

/**
 * Task Filters Component
 */
export function TaskFilters({ filters, categories, onFiltersChange }: TaskFiltersProps) {
  const handleStatusChange = (status?: 'active' | 'completed' | 'archived') => {
    onFiltersChange({ ...filters, status });
  };

  const handlePriorityChange = (priority?: 'low' | 'medium' | 'high') => {
    onFiltersChange({ ...filters, priority });
  };

  const handleCategoryChange = (categoryId?: string) => {
    onFiltersChange({ ...filters, categoryId });
  };

  const handleClearFilters = () => {
    onFiltersChange({ status: 'active' });
  };

  const hasActiveFilters = filters.priority || filters.categoryId || filters.status !== 'active';

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Status
        </h3>
        <div className="space-y-2">
          {[
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'archived', label: 'Archived' },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="status"
                value={value}
                checked={filters.status === value}
                onChange={() => handleStatusChange(value as any)}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
                {label}
              </span>
            </label>
          ))}
          <label className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name="status"
              checked={!filters.status}
              onChange={() => handleStatusChange(undefined)}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
              All
            </span>
          </label>
        </div>
      </div>

      {/* Priority Filter */}
      <div className="mb-6">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Priority
        </h3>
        <div className="space-y-2">
          {[
            { value: 'high', label: 'High', color: 'text-red-600 dark:text-red-400' },
            { value: 'medium', label: 'Medium', color: 'text-blue-600 dark:text-blue-400' },
            { value: 'low', label: 'Low', color: 'text-gray-600 dark:text-gray-400' },
          ].map(({ value, label, color }) => (
            <label key={value} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.priority === value}
                onChange={(e) => handlePriorityChange(e.target.checked ? (value as any) : undefined)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`ml-2 text-sm ${color} group-hover:opacity-80`}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Category
          </h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.categoryId === category.id}
                  onChange={(e) => handleCategoryChange(e.target.checked ? category.id : undefined)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 flex items-center text-sm text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white">
                  {category.icon && <span className="mr-1">{category.icon}</span>}
                  <span
                    className="inline-block h-2 w-2 rounded-full mr-1.5"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
