import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SettingsCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const SettingsCard = forwardRef<HTMLDivElement, SettingsCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass-panel rounded-2xl divide-y divide-border/30 shadow-sm',
          'animate-fade-in',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SettingsCard.displayName = 'SettingsCard';
