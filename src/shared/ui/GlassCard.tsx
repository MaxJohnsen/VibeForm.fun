import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  animate?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6 md:p-8',
  lg: 'p-8 md:p-10',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, hover = false, animate = true, padding = 'sm', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-card border border-border rounded-2xl shadow-sm',
          paddingClasses[padding],
          hover && 'hover:shadow-md hover:border-border/80 transition-all duration-200',
          animate && 'animate-fade-in',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';