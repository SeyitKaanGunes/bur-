'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-200 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 backdrop-blur-sm border border-white/10',
            'text-white placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        {hint && !error && <p className="mt-2 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
