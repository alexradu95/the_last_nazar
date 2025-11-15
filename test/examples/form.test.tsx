/**
 * Example Component Test: Form
 *
 * Demonstrates:
 * - Testing form submissions
 * - Testing form validation
 * - Testing controlled inputs
 * - Testing error states
 */

import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/react';
import { useState } from 'react';

/**
 * Simple Form component for testing
 */
type FormData = {
  email: string;
  password: string;
};

type LoginFormProps = {
  onSubmit: (data: FormData) => void | Promise<void>;
  isLoading?: boolean;
};

const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" role="alert">
            {errors.password}
          </span>
        )}
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
};

describe('LoginForm Component', () => {
  describe('Rendering', () => {
    it('should render email and password inputs', () => {
      const onSubmit = vi.fn();
      renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      const onSubmit = vi.fn();
      renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('should show loading state when isLoading is true', () => {
      const onSubmit = vi.fn();
      renderWithProviders(<LoginForm onSubmit={onSubmit} isLoading />);

      expect(screen.getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show error when email format is invalid', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is too short', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'short');

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      expect(
        screen.getByText('Password must be at least 8 characters')
      ).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should show multiple errors simultaneously', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle async submission', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('should prevent default form submission', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const form = screen.getByRole('form', { name: 'Login form' });
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should update email input on typing', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should update password input on typing', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      await user.type(passwordInput, 'password123');

      expect(passwordInput.value).toBe('password123');
    });

    it('should clear errors when user corrects input', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      // First, trigger validation error
      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      expect(screen.getByText('Email is required')).toBeInTheDocument();

      // Then correct the input
      const emailInput = screen.getByLabelText('Email');
      await user.type(emailInput, 'test@example.com');

      // Submit again - error should be cleared
      await user.click(submitButton);

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form label', () => {
      const onSubmit = vi.fn();
      renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      expect(screen.getByRole('form', { name: 'Login form' })).toBeInTheDocument();
    });

    it('should associate labels with inputs', () => {
      const onSubmit = vi.fn();
      renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('should mark invalid inputs with aria-invalid', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('should associate error messages with inputs', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
    });

    it('should announce errors to screen readers', async () => {
      const onSubmit = vi.fn();
      const { user } = renderWithProviders(<LoginForm onSubmit={onSubmit} />);

      const submitButton = screen.getByRole('button', { name: 'Login' });
      await user.click(submitButton);

      const emailError = screen.getByText('Email is required');
      const passwordError = screen.getByText('Password is required');

      expect(emailError).toHaveAttribute('role', 'alert');
      expect(passwordError).toHaveAttribute('role', 'alert');
    });
  });
});
