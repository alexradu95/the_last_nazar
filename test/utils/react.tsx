/**
 * React Testing Library Utilities
 */

import { render, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';

/**
 * Custom render with common providers
 */
type RenderWithProvidersOptions = {
  initialState?: any;
  route?: string;
};

export const renderWithProviders = (
  ui: ReactElement,
  options: RenderWithProvidersOptions = {}
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const { initialState, route = '/' } = options;

  // Set up userEvent
  const user = userEvent.setup();

  // Set initial route if provided
  if (route !== '/') {
    window.history.pushState({}, '', route);
  }

  // Wrapper component with providers
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <>{children}</>;
  };

  const renderResult = render(ui, { wrapper: Wrapper });

  return {
    ...renderResult,
    user,
  };
};

/**
 * Helper to test accessibility
 */
export const testAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('jest-axe');
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

/**
 * Helper to wait for element to be removed
 */
export { waitForElementToBeRemoved } from '@testing-library/react';

/**
 * Helper to find by text content (case insensitive)
 */
export const findByTextContent = (text: string) => {
  return (_content: string, element: Element | null) => {
    const hasText = (el: Element | null) =>
      el?.textContent?.toLowerCase().includes(text.toLowerCase()) ?? false;
    const elementHasText = hasText(element);
    const childrenDontHaveText = Array.from(element?.children || []).every(
      (child) => !hasText(child)
    );
    return elementHasText && childrenDontHaveText;
  };
};

/**
 * Mock form event handlers
 */
export const createMockFormHandlers = () => {
  return {
    onSubmit: vi.fn((e?: any) => e?.preventDefault?.()),
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onFocus: vi.fn(),
  };
};

/**
 * Helper to test component with different viewport sizes
 */
export const testResponsive = (
  component: ReactElement,
  breakpoints: Record<string, { width: number; height: number }>
) => {
  return Object.entries(breakpoints).map(([name, { width, height }]) => {
    return {
      name,
      setup: () => {
        global.innerWidth = width;
        global.innerHeight = height;
        window.dispatchEvent(new Event('resize'));
        return renderWithProviders(component);
      },
    };
  });
};
