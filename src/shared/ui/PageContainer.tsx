import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps {
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'accent';
  className?: string;
}

const variantClasses = {
  default: 'bg-gradient-to-br from-background via-background to-muted/20',
  subtle: 'bg-background',
  accent: 'bg-gradient-to-br from-background via-muted/10 to-primary/5',
};

export const PageContainer = ({
  children,
  variant = 'default',
  className,
}: PageContainerProps) => {
  return (
    <div className={cn('min-h-screen', variantClasses[variant], className)}>
      {children}
    </div>
  );
};
