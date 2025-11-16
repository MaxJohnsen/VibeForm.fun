import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SocialButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'apple';
  children: React.ReactNode;
}

export const SocialButton = forwardRef<HTMLButtonElement, SocialButtonProps>(
  ({ className, provider, children, ...props }, ref) => {
    const isGoogle = provider === 'google';

    return (
      <button
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl font-medium',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          'hover-elevate',
          isGoogle
            ? 'bg-white border border-border text-foreground hover:bg-secondary'
            : 'bg-foreground text-background hover:opacity-90',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

SocialButton.displayName = 'SocialButton';
