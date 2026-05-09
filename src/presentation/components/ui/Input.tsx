import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@shared/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leftIcon, rightSlot, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <div className="w-full">
        {label ? (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-foreground">
            {label}
          </label>
        ) : null}
        <div
          className={cn(
            'group flex items-center gap-2 rounded-lg border bg-surface px-3 transition-shadow',
            'border-border focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500',
            error && 'border-danger focus-within:ring-danger focus-within:border-danger',
          )}
        >
          {leftIcon ? <span className="text-muted">{leftIcon}</span> : null}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex h-10 w-full bg-transparent text-sm placeholder:text-subtle outline-none',
              className,
            )}
            {...rest}
          />
          {rightSlot}
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
