import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageContainerProps {
  children: ReactNode;
  variant?: 'default' | 'subtle' | 'accent';
  className?: string;
}

const variantClasses = {
  default: 'bg-background',
  subtle: 'bg-background',
  accent: 'bg-background',
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