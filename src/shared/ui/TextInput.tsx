import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground block"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white border border-border',
            'text-foreground placeholder:text-muted-foreground',
            'input-focus-glow',
            'transition-all duration-300',
            error && 'border-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

TextInput.displayName = 'TextInput';
