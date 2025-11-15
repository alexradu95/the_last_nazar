/**
 * Toast Notification Component
 *
 * Animated toast notifications for user feedback
 */

'use client';

import { useEffect, useRef } from 'react';
import { anime } from '@/lib/animations/config';
import { shouldReduceMotion } from '@/lib/animations/accessibility';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export function Toast({ message, type, duration = 3000, onClose, position = 'top-right' }: ToastProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      if (shouldReduceMotion()) {
        ref.current.style.opacity = '1';
        ref.current.style.transform = 'translateX(0)';
      } else {
        // Enter animation
        anime({
          targets: ref.current,
          translateX: position.includes('right') ? [300, 0] : [-300, 0],
          opacity: [0, 1],
          duration: 400,
          easing: 'easeOutCubic',
        });
      }

      // Auto close after duration
      const timer = setTimeout(() => {
        if (ref.current) {
          if (shouldReduceMotion()) {
            onClose();
          } else {
            anime({
              targets: ref.current,
              translateX: position.includes('right') ? 300 : -300,
              opacity: 0,
              duration: 300,
              easing: 'easeInCubic',
              complete: onClose,
            });
          }
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, position]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const icons = {
    success: '✓',
    error: '✗',
    info: 'ℹ',
    warning: '⚠',
  };

  const positionClasses = {
    'top-right': 'right-4 top-4',
    'top-left': 'left-4 top-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'left-1/2 top-4 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  };

  return (
    <div
      ref={ref}
      className={`${colors[type]} ${positionClasses[position]} fixed z-50 flex items-center gap-3 rounded-lg px-6 py-4 text-white shadow-lg`}
      style={{ opacity: 0 }}
    >
      <span className="text-2xl">{icons[type]}</span>
      <span>{message}</span>
      <button
        onClick={() => {
          if (shouldReduceMotion()) {
            onClose();
          } else if (ref.current) {
            anime({
              targets: ref.current,
              opacity: 0,
              duration: 200,
              complete: onClose,
            });
          }
        }}
        className="ml-2 opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Toast Container and Hook for managing multiple toasts
 */
import { createContext, useContext, useState, useCallback } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const showError = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const showInfo = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);
  const showWarning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-50">
        {toasts.map((toast, index) => (
          <div key={toast.id} style={{ position: 'relative', top: `${index * 80}px` }}>
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
