'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'cursor-pointer select-none',
          {
            // Variants
            'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-indigo-500':
              variant === 'primary',
            'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20':
              variant === 'secondary',
            'bg-transparent text-gray-300 hover:bg-white/10': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
            // Sizes
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
