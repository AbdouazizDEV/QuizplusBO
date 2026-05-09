import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@shared/lib/cn';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, placeholder, className, id, ...rest }, ref) => {
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
            'relative flex items-center rounded-lg border bg-surface px-3 transition-shadow',
            'border-border focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500',
            error && 'border-danger focus-within:ring-danger focus-within:border-danger',
          )}
        >
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'h-10 w-full appearance-none bg-transparent pr-7 text-sm outline-none',
              !rest.value && 'text-muted',
              className,
            )}
            {...rest}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-foreground">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted" />
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
Select.displayName = 'Select';
