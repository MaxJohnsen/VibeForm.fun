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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-background bg-dot-pattern">
      <div
        className={cn(
          'relative w-full max-w-[480px]',
          'bg-card',
          'border border-border',
          'rounded-3xl shadow-sm',
          'p-8 sm:p-10',
          'animate-fade-in',
          className
        )}
      >
        <div className="relative flex flex-col items-center gap-8">
          {/* Brand Logo */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary font-heading">
            Fairform
          </h1>

          {/* Icon & Title Section */}
          <div className="text-center space-y-3">
            {Icon && (
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground font-heading">
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