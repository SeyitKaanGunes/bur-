'use client';

import { cn } from '../utils';

export interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  color?: 'indigo' | 'pink' | 'emerald' | 'amber';
  showValue?: boolean;
  className?: string;
}

const colorClasses = {
  indigo: 'from-indigo-500 to-indigo-600',
  pink: 'from-pink-500 to-pink-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
};

export function ScoreBar({
  label,
  score,
  maxScore = 10,
  color = 'indigo',
  showValue = true,
  className,
}: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {showValue && (
          <span className="text-sm font-bold text-white">
            {score}/{maxScore}
          </span>
        )}
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500',
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
