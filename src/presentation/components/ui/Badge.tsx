import type { HTMLAttributes } from 'react';
import { cn } from '@shared/lib/cn';

type Tone =
  | 'brand'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-500/10 text-brand-600 ring-1 ring-inset ring-brand-500/20',
  accent: 'bg-accent-300/15 text-accent-500 ring-1 ring-inset ring-accent-300/30',
  success: 'bg-success/10 text-success ring-1 ring-inset ring-success/20',
  warning: 'bg-warning/10 text-warning ring-1 ring-inset ring-warning/25',
  danger: 'bg-danger/10 text-danger ring-1 ring-inset ring-danger/20',
  info: 'bg-info/10 text-info ring-1 ring-inset ring-info/20',
  neutral: 'bg-surfaceMuted text-muted ring-1 ring-inset ring-border',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: 'sm' | 'md';
}

export function Badge({ tone = 'neutral', size = 'md', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs',
        TONES[tone],
        className,
      )}
      {...rest}
    />
  );
}
