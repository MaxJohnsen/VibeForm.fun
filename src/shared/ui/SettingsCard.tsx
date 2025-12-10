import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SettingsCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  description?: string;
  variant?: 'default' | 'danger';
}

export const SettingsCard = forwardRef<HTMLDivElement, SettingsCardProps>(
  ({ className, children, title, description, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel rounded-2xl shadow-sm',
          'animate-fade-in',
          variant === 'danger' && 'border-destructive/30 bg-destructive/5',
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className={cn(
            'px-5 py-4 border-b border-border/30',
            variant === 'danger' && 'border-destructive/20'
          )}>
            {title && (
              <h3 className={cn(
                'font-semibold',
                variant === 'danger' && 'text-destructive'
              )}>
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        )}
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    );
  }
);

SettingsCard.displayName = 'SettingsCard';
