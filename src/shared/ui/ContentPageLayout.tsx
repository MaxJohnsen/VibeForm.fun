import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ContentPageLayoutProps {
  header: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  className?: string;
}

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export const ContentPageLayout = ({
  header,
  children,
  maxWidth = '7xl',
  className,
}: ContentPageLayoutProps) => {
  return (
    <div className={cn("min-h-screen bg-gradient-to-b from-background to-muted/20", className)}>
      {header}
      <div className={cn("mx-auto px-4 md:px-8 py-4 md:py-8", maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
};
