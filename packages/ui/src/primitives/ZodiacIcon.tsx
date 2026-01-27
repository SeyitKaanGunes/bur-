'use client';

import type { ZodiacSign } from '@burcum/shared';
import { ZODIAC_DATA } from '@burcum/shared';
import { cn } from '../utils';

export interface ZodiacIconProps {
  sign: ZodiacSign;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-8xl',
};

const containerSizes = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
};

export function ZodiacIcon({ sign, size = 'md', showName = false, className }: ZodiacIconProps) {
  const data = ZODIAC_DATA[sign];

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full',
          'bg-gradient-to-br from-indigo-500/30 to-purple-500/30',
          'border border-white/20',
          containerSizes[size]
        )}
      >
        <span className={cn(sizeClasses[size], 'select-none')}>{data.symbol}</span>
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-300">{data.turkishName}</span>
      )}
    </div>
  );
}
