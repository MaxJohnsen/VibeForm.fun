import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, children, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-background hover:bg-muted text-foreground',
      ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground',
      destructive: 'hover:bg-destructive/10 text-destructive hover:text-destructive',
    };

    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          'border border-border/50',
          'hover-elevate',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
