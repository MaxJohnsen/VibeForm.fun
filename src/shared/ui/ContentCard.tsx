import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { SectionHeader } from './SectionHeader';

export interface ContentCardProps {
  title?: string;
  children: ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  rounded?: 'lg' | 'xl' | '2xl';
  className?: string;
  headerSize?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8',
};

const roundedClasses = {
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

export const ContentCard = ({
  title,
  children,
  padding = 'md',
  rounded = 'xl',
  className,
  headerSize = 'md',
}: ContentCardProps) => {
  return (
    <GlassCard
      padding="none"
      className={cn(
        paddingClasses[padding],
        roundedClasses[rounded],
        className
      )}
    >
      {title && <SectionHeader size={headerSize}>{title}</SectionHeader>}
      {children}
    </GlassCard>
  );
};
