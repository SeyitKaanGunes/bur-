'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-300 relative isolate',
          {
            // Variants
            'bg-white/5 backdrop-blur-md border border-white/10': variant === 'default',
            'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20':
              variant === 'gradient',
            'bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl': variant === 'glass',
            // Padding
            'p-0': padding === 'none',
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
