/**
 * Example Component Test: Button
 *
 * Demonstrates:
 * - Testing user interactions
 * - Testing component variants
 * - Testing accessibility
 * - Testing event handlers
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/react';

/**
 * Simple Button component for testing
 */
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      renderWithProviders(<Button>Click me</Button>);

      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should render with primary variant by default', () => {
      renderWithProviders(<Button>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-blue-600');
    });

    it('should render with secondary variant when specified', () => {
      renderWithProviders(<Button variant="secondary">Click me</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-200');
    });

    it('should render with destructive variant when specified', () => {
      renderWithProviders(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-red-600');
    });
  });

  describe('Interactions', () => {
    it('should call onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const { user } = renderWithProviders(
        <Button onClick={handleClick}>Click me</Button>
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const { user } = renderWithProviders(
        <Button onClick={handleClick} disabled>
          Click me
        </Button>
      );

      await user.click(screen.getByRole('button'));

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should be keyboard accessible', async () => {
      const handleClick = vi.fn();
      const { user } = renderWithProviders(
        <Button onClick={handleClick}>Click me</Button>
      );

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Disabled State', () => {
    it('should show disabled state visually', () => {
      renderWithProviders(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain('opacity-50');
    });

    it('should have disabled cursor style', () => {
      renderWithProviders(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('cursor-not-allowed');
    });
  });

  describe('Button Types', () => {
    it('should default to button type', () => {
      renderWithProviders(<Button>Click me</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('should support submit type', () => {
      renderWithProviders(<Button type="submit">Submit</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('should support reset type', () => {
      renderWithProviders(<Button type="reset">Reset</Button>);

      expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      renderWithProviders(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
    });

    it('should indicate disabled state to assistive technology', () => {
      renderWithProviders(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });
  });
});
