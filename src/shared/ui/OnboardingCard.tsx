import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingCardProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const OnboardingCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
  className,
}: OnboardingCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-dots">
      <div
        className={cn(
          'relative w-full max-w-[480px]',
          'bg-card/80 backdrop-blur-xl',
          'border border-border/50',
          'rounded-3xl shadow-2xl',
          'p-8 sm:p-10',
          'animate-fade-in',
          className
        )}
      >
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        <div className="relative flex flex-col items-center gap-8">
          {/* Brand Logo with Icon */}
          <div className="relative flex items-center gap-2">
            <i className="fa-sharp fa-regular fa-comment-dot text-3xl sm:text-4xl text-primary" />
            <div>
              <span className="text-4xl sm:text-5xl font-black tracking-tight font-logo text-slate-800">
                Fair
              </span>
              <span className="text-4xl sm:text-5xl font-black tracking-tight font-logo text-primary">
                form
              </span>
            </div>
            <div className="absolute -inset-2 bg-primary/10 blur-2xl -z-10 animate-pulse" />
          </div>

          {/* Icon & Title Section */}
          <div className="text-center space-y-3">
            {Icon && (
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h2>{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground max-w-sm text-sm sm:text-base leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="w-full space-y-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="w-full pt-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
