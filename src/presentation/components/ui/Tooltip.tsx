import type { ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom';
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-30 hidden whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-2xs font-semibold text-background shadow group-hover:block',
          side === 'top' && '-top-7 left-1/2 -translate-x-1/2',
          side === 'bottom' && 'top-full mt-1.5 left-1/2 -translate-x-1/2',
        )}
      >
        {content}
      </span>
    </span>
  );
}
