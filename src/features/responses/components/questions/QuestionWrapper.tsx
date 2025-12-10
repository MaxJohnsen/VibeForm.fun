import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface QuestionWrapperProps {
  children: ReactNode;
  centered?: boolean;
  className?: string;
}

export const QuestionWrapper = ({
  children,
  centered = false,
  className,
}: QuestionWrapperProps) => {
  return (
    <div
      className={cn(
        'space-y-6 sm:space-y-8 animate-fade-in',
        centered && 'text-center',
        className
      )}
    >
      {children}
    </div>
  );
};
