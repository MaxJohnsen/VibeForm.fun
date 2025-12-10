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
          {/* Brand Logo */}
          <div className="relative">
            <h1 className="text-title-lg sm:text-5xl font-heading font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Fairform
            </h1>
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 blur-2xl -z-10 animate-pulse" />
          </div>

          {/* Icon & Title Section */}
          <div className="text-center space-y-3">
            {Icon && (
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h2 className="text-section-lg sm:text-title font-heading font-semibold text-foreground">
              {title}
            </h2>
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
