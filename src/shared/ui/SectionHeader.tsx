import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'text-sm font-medium mb-2 md:mb-3',
  md: 'text-lg mb-3 md:mb-4',
  lg: 'text-xl mb-4 md:mb-5',
};

export const SectionHeader = ({
  children,
  size = 'md',
  className,
}: SectionHeaderProps) => {
  return (
    <h3 className={cn(sizeClasses[size], className)}>
      {children}
    </h3>
  );
};
