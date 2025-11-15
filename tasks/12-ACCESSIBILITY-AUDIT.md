# Task 12: Comprehensive Accessibility Audit & Remediation

**Status**: Not Started
**Priority**: High
**Estimated Effort**: 2-3 hours
**Dependencies**: Task 08 (E2E tests for accessibility validation)

## Objective

Conduct comprehensive accessibility audit and remediation to ensure Life OS is fully usable by people with disabilities, meeting WCAG 2.1 Level AA standards.

## Context

While we've built features with accessibility in mind, we haven't:
- Conducted formal accessibility audit
- Tested with screen readers comprehensively
- Verified keyboard navigation throughout
- Checked color contrast ratios
- Tested with assistive technologies
- Documented accessibility features

## Success Criteria

1. ✅ WCAG 2.1 Level AA compliance
2. ✅ Screen reader compatibility (NVDA, JAWS, VoiceOver)
3. ✅ Full keyboard navigation support
4. ✅ Color contrast ratio >= 4.5:1
5. ✅ ARIA attributes properly implemented
6. ✅ Focus management working correctly
7. ✅ Form validation accessible
8. ✅ Error messages announced to screen readers
9. ✅ Automated accessibility tests passing
10. ✅ Accessibility documentation complete

## Implementation Steps

### Phase 1: Automated Accessibility Testing (30 mins)

1. **Install accessibility testing tools**
   ```bash
   npm install -D @axe-core/playwright eslint-plugin-jsx-a11y
   npm install -D @testing-library/jest-dom vitest-axe
   ```

2. **Configure ESLint for accessibility**
   ```javascript
   // .eslintrc.js
   module.exports = {
     extends: [
       'next/core-web-vitals',
       'plugin:jsx-a11y/recommended',
     ],
     plugins: ['jsx-a11y'],
     rules: {
       'jsx-a11y/anchor-is-valid': 'error',
       'jsx-a11y/aria-props': 'error',
       'jsx-a11y/aria-proptypes': 'error',
       'jsx-a11y/aria-unsupported-elements': 'error',
       'jsx-a11y/role-has-required-aria-props': 'error',
       'jsx-a11y/role-supports-aria-props': 'error',
       'jsx-a11y/alt-text': 'error',
       'jsx-a11y/img-redundant-alt': 'error',
       'jsx-a11y/label-has-associated-control': 'error',
       'jsx-a11y/no-autofocus': 'warn',
       'jsx-a11y/no-distracting-elements': 'error',
     },
   };
   ```

3. **Create accessibility test utilities**
   ```typescript
   // test/utils/accessibility.ts
   import { expect } from '@playwright/test';
   import AxeBuilder from '@axe-core/playwright';

   export async function testAccessibility(page: Page, url: string) {
     await page.goto(url);

     const accessibilityScanResults = await new AxeBuilder({ page })
       .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
       .analyze();

     expect(accessibilityScanResults.violations).toEqual([]);

     return accessibilityScanResults;
   }

   export async function testKeyboardNavigation(page: Page) {
     // Tab through all focusable elements
     const focusableElements = await page.locator(
       'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
     ).all();

     for (let i = 0; i < focusableElements.length; i++) {
       await page.keyboard.press('Tab');
       const activeElement = page.locator(':focus');
       await expect(activeElement).toBeVisible();
     }
   }
   ```

4. **Add accessibility tests to E2E suite**
   ```typescript
   // e2e/tests/accessibility/comprehensive.spec.ts
   import { test, expect } from '@playwright/test';
   import { testAccessibility, testKeyboardNavigation } from '@/test/utils/accessibility';

   test.describe('Accessibility Audit', () => {
     const pages = [
       '/',
       '/auth/login',
       '/auth/register',
       '/dashboard',
       '/tasks',
       '/agents',
     ];

     for (const url of pages) {
       test(`${url} should have no accessibility violations`, async ({ page }) => {
         await testAccessibility(page, url);
       });

       test(`${url} should support keyboard navigation`, async ({ page }) => {
         await page.goto(url);
         await testKeyboardNavigation(page);
       });
     }
   });
   ```

### Phase 2: Semantic HTML & ARIA (45 mins)

1. **Audit and fix semantic HTML**
   ```tsx
   // Before: Non-semantic markup
   <div onClick={handleClick}>Click me</div>

   // After: Proper button element
   <button onClick={handleClick}>Click me</button>

   // Before: Generic divs for structure
   <div className="header">
     <div className="nav">
       <div>Home</div>
       <div>About</div>
     </div>
   </div>

   // After: Semantic HTML5 elements
   <header>
     <nav aria-label="Main navigation">
       <a href="/">Home</a>
       <a href="/about">About</a>
     </nav>
   </header>
   ```

2. **Implement proper ARIA labels**
   ```tsx
   // components/TaskList.tsx
   export function TaskList({ tasks }: TaskListProps) {
     return (
       <div role="region" aria-labelledby="task-list-heading">
         <h2 id="task-list-heading">Your Tasks</h2>
         <ul aria-label="Task list">
           {tasks.map((task) => (
             <li key={task.id}>
               <article aria-labelledby={`task-${task.id}-title`}>
                 <h3 id={`task-${task.id}-title`}>{task.title}</h3>
                 <p>{task.description}</p>
                 <button
                   aria-label={`Mark "${task.title}" as complete`}
                   onClick={() => completeTask(task.id)}
                 >
                   Complete
                 </button>
                 <button
                   aria-label={`Delete "${task.title}"`}
                   onClick={() => deleteTask(task.id)}
                 >
                   Delete
                 </button>
               </article>
             </li>
           ))}
         </ul>
       </div>
     );
   }
   ```

3. **Add live regions for dynamic content**
   ```tsx
   // components/Toast.tsx
   export function Toast({ message, type }: ToastProps) {
     return (
       <div
         role="status"
         aria-live="polite"
         aria-atomic="true"
         className={`toast toast-${type}`}
       >
         <p>{message}</p>
       </div>
     );
   }

   // For urgent messages
   export function ErrorToast({ message }: ErrorToastProps) {
     return (
       <div
         role="alert"
         aria-live="assertive"
         aria-atomic="true"
         className="toast toast-error"
       >
         <p>{message}</p>
       </div>
     );
   }
   ```

4. **Implement skip links**
   ```tsx
   // components/SkipLinks.tsx
   export function SkipLinks() {
     return (
       <div className="skip-links">
         <a href="#main-content" className="skip-link">
           Skip to main content
         </a>
         <a href="#navigation" className="skip-link">
           Skip to navigation
         </a>
       </div>
     );
   }
   ```

   ```css
   /* styles/accessibility.css */
   .skip-link {
     position: absolute;
     top: -40px;
     left: 0;
     background: #000;
     color: #fff;
     padding: 8px;
     text-decoration: none;
     z-index: 100;
   }

   .skip-link:focus {
     top: 0;
   }
   ```

### Phase 3: Keyboard Navigation (45 mins)

1. **Implement focus management**
   ```tsx
   // components/Modal.tsx
   import { useEffect, useRef } from 'react';
   import FocusTrap from 'focus-trap-react';

   export function Modal({ isOpen, onClose, children }: ModalProps) {
     const closeButtonRef = useRef<HTMLButtonElement>(null);

     useEffect(() => {
       if (isOpen) {
         closeButtonRef.current?.focus();
       }
     }, [isOpen]);

     if (!isOpen) return null;

     return (
       <FocusTrap>
         <div
           role="dialog"
           aria-modal="true"
           aria-labelledby="modal-title"
           className="modal-overlay"
         >
           <div className="modal-content">
             <button
               ref={closeButtonRef}
               onClick={onClose}
               aria-label="Close dialog"
               className="modal-close"
             >
               ×
             </button>
             {children}
           </div>
         </div>
       </FocusTrap>
     );
   }
   ```

2. **Add keyboard shortcuts**
   ```tsx
   // hooks/useKeyboardShortcuts.ts
   import { useEffect } from 'react';

   export function useKeyboardShortcuts() {
     useEffect(() => {
       const handleKeyPress = (event: KeyboardEvent) => {
         // Only trigger if not in input field
         if (
           event.target instanceof HTMLInputElement ||
           event.target instanceof HTMLTextAreaElement
         ) {
           return;
         }

         // Ctrl/Cmd + K: Open command palette
         if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
           event.preventDefault();
           openCommandPalette();
         }

         // Ctrl/Cmd + N: New task
         if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
           event.preventDefault();
           openNewTaskDialog();
         }

         // ? : Show keyboard shortcuts
         if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
           event.preventDefault();
           showKeyboardShortcuts();
         }
       };

       document.addEventListener('keydown', handleKeyPress);

       return () => {
         document.removeEventListener('keydown', handleKeyPress);
       };
     }, []);
   }
   ```

3. **Create keyboard shortcuts help**
   ```tsx
   // components/KeyboardShortcutsHelp.tsx
   export function KeyboardShortcutsHelp() {
     return (
       <div role="dialog" aria-labelledby="shortcuts-title">
         <h2 id="shortcuts-title">Keyboard Shortcuts</h2>
         <dl>
           <div>
             <dt><kbd>Ctrl</kbd> + <kbd>K</kbd></dt>
             <dd>Open command palette</dd>
           </div>
           <div>
             <dt><kbd>Ctrl</kbd> + <kbd>N</kbd></dt>
             <dd>Create new task</dd>
           </div>
           <div>
             <dt><kbd>?</kbd></dt>
             <dd>Show this help</dd>
           </div>
           <div>
             <dt><kbd>Tab</kbd></dt>
             <dd>Navigate forward</dd>
           </div>
           <div>
             <dt><kbd>Shift</kbd> + <kbd>Tab</kbd></dt>
             <dd>Navigate backward</dd>
           </div>
           <div>
             <dt><kbd>Enter</kbd> or <kbd>Space</kbd></dt>
             <dd>Activate element</dd>
           </div>
           <div>
             <dt><kbd>Escape</kbd></dt>
             <dd>Close dialog</dd>
           </div>
         </dl>
       </div>
     );
   }
   ```

### Phase 4: Color Contrast & Visual Accessibility (30 mins)

1. **Audit color contrast**
   ```bash
   # Install contrast checker
   npm install -D @adobe/leonardo-contrast-colors
   ```

2. **Fix contrast issues**
   ```css
   /* Before: Insufficient contrast (2.5:1) */
   .text-muted {
     color: #999; /* on white background */
   }

   /* After: WCAG AA compliant (4.5:1) */
   .text-muted {
     color: #666; /* on white background */
   }

   /* Before: Insufficient contrast for small text */
   .button-secondary {
     background: #5cb3fd;
     color: #fff; /* 3.2:1 */
   }

   /* After: WCAG AA compliant */
   .button-secondary {
     background: #0d8aee;
     color: #fff; /* 4.5:1 */
   }
   ```

3. **Add focus indicators**
   ```css
   /* styles/focus.css */

   /* Remove default outline */
   * {
     outline: none;
   }

   /* Add custom focus indicators */
   :focus-visible {
     outline: 2px solid #0d8aee;
     outline-offset: 2px;
     border-radius: 4px;
   }

   /* High contrast for buttons */
   button:focus-visible,
   a:focus-visible {
     outline: 3px solid #0d8aee;
     outline-offset: 2px;
   }

   /* Different indicator for inputs */
   input:focus-visible,
   textarea:focus-visible,
   select:focus-visible {
     outline: 2px solid #0d8aee;
     outline-offset: 0;
     box-shadow: 0 0 0 3px rgba(13, 138, 238, 0.2);
   }
   ```

4. **Implement high contrast mode support**
   ```css
   /* styles/high-contrast.css */

   @media (prefers-contrast: high) {
     :root {
       --bg-primary: #000;
       --text-primary: #fff;
       --border: #fff;
     }

     .button {
       border: 2px solid currentColor;
     }

     .card {
       border: 2px solid currentColor;
     }
   }
   ```

### Phase 5: Form Accessibility (30 mins)

1. **Implement accessible form validation**
   ```tsx
   // components/AccessibleInput.tsx
   import { useId } from 'react';

   type AccessibleInputProps = {
     label: string;
     error?: string;
     required?: boolean;
     helpText?: string;
   } & React.InputHTMLAttributes<HTMLInputElement>;

   export function AccessibleInput({
     label,
     error,
     required,
     helpText,
     ...props
   }: AccessibleInputProps) {
     const id = useId();
     const errorId = `${id}-error`;
     const helpId = `${id}-help`;

     return (
       <div className="form-field">
         <label htmlFor={id}>
           {label}
           {required && <span aria-label="required"> *</span>}
         </label>

         <input
           id={id}
           aria-invalid={error ? 'true' : 'false'}
           aria-describedby={`${error ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
           aria-required={required}
           {...props}
         />

         {helpText && (
           <p id={helpId} className="help-text">
             {helpText}
           </p>
         )}

         {error && (
           <p id={errorId} className="error-text" role="alert">
             {error}
           </p>
         )}
       </div>
     );
   }
   ```

2. **Add form-level error summary**
   ```tsx
   // components/FormErrorSummary.tsx
   export function FormErrorSummary({ errors }: { errors: Record<string, string> }) {
     const errorEntries = Object.entries(errors);

     if (errorEntries.length === 0) return null;

     return (
       <div
         role="alert"
         aria-labelledby="error-summary-title"
         className="error-summary"
       >
         <h2 id="error-summary-title">There are errors in the form</h2>
         <ul>
           {errorEntries.map(([field, message]) => (
             <li key={field}>
               <a href={`#${field}`}>{message}</a>
             </li>
           ))}
         </ul>
       </div>
     );
   }
   ```

### Phase 6: Screen Reader Testing & Documentation (30 mins)

1. **Create screen reader test script**
   ```markdown
   # Screen Reader Testing Checklist

   ## Test with NVDA (Windows)
   - [ ] Navigate through all pages with Tab key
   - [ ] All interactive elements are announced
   - [ ] Form labels are associated correctly
   - [ ] Error messages are announced
   - [ ] Dynamic content updates announced
   - [ ] Heading hierarchy is logical

   ## Test with VoiceOver (macOS)
   - [ ] Navigate with VO+Right Arrow through all elements
   - [ ] All landmarks are announced
   - [ ] Images have appropriate alt text
   - [ ] Buttons have descriptive labels
   - [ ] Modal dialogs trap focus
   - [ ] Live regions announce updates

   ## Test with JAWS (Windows)
   - [ ] Forms mode works correctly
   - [ ] Tables are navigable
   - [ ] Lists are properly structured
   - [ ] Links are descriptive
   - [ ] Page title is announced on navigation
   ```

2. **Document accessibility features**
   ```markdown
   # docs/ACCESSIBILITY.md

   # Accessibility Features

   ## Keyboard Navigation

   Life OS is fully keyboard accessible:

   - **Tab**: Move forward through interactive elements
   - **Shift + Tab**: Move backward
   - **Enter/Space**: Activate buttons and links
   - **Escape**: Close dialogs and menus
   - **Arrow keys**: Navigate within lists and menus

   ## Keyboard Shortcuts

   - **Ctrl/Cmd + K**: Open command palette
   - **Ctrl/Cmd + N**: Create new task
   - **?**: Show keyboard shortcuts help

   ## Screen Reader Support

   - Compatible with NVDA, JAWS, and VoiceOver
   - Proper ARIA labels throughout
   - Live regions for dynamic updates
   - Skip links for quick navigation

   ## Visual Accessibility

   - WCAG 2.1 Level AA color contrast
   - Visible focus indicators
   - High contrast mode support
   - Reduced motion support

   ## Reporting Issues

   If you encounter accessibility issues, please:
   1. Open an issue on GitHub
   2. Include screen reader name and version
   3. Describe the expected behavior
   4. Provide steps to reproduce
   ```

## Testing Strategy

### Manual Testing Checklist

- [ ] Test with NVDA screen reader
- [ ] Test with VoiceOver
- [ ] Test keyboard-only navigation
- [ ] Test with 200% zoom
- [ ] Test with Windows High Contrast mode
- [ ] Test with reduced motion enabled
- [ ] Test form validation errors
- [ ] Test dynamic content updates
- [ ] Test modal dialogs
- [ ] Test all interactive components

### Automated Testing

```bash
# Run accessibility tests
npm run test:e2e -- accessibility/

# Run with different screen sizes
npm run test:e2e -- --project=mobile-chrome

# Generate accessibility report
npm run test:e2e -- --reporter=html
```

## Scripts to Add

```json
{
  "scripts": {
    "test:a11y": "npm run test:e2e -- accessibility/",
    "lint:a11y": "eslint --ext .tsx,.ts . --rule 'jsx-a11y/*: error'",
    "audit:a11y": "lighthouse http://localhost:3000 --only-categories=accessibility --output=html --output-path=./accessibility-report.html"
  }
}
```

## Deliverables

1. ✅ All automated accessibility tests passing
2. ✅ WCAG 2.1 Level AA compliance
3. ✅ Screen reader compatibility verified
4. ✅ Keyboard navigation functional
5. ✅ Color contrast issues fixed
6. ✅ Focus management implemented
7. ✅ Accessibility documentation complete
8. ✅ Manual testing checklist completed

## Validation Steps

1. Run `npm run test:a11y` - all tests pass
2. Navigate entire app with keyboard only
3. Test with NVDA and VoiceOver
4. Verify all color contrasts with tool
5. Check all forms with screen reader
6. Test dynamic content updates
7. Verify modal dialogs trap focus
8. Review accessibility documentation

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Accessible Rich Internet Applications (WAI-ARIA)](https://www.w3.org/TR/wai-aria/)

## Notes

- Accessibility is an ongoing commitment, not a one-time fix
- Test with real users who use assistive technologies when possible
- Keep accessibility in mind for all new features
- Document accessibility considerations in code reviews
