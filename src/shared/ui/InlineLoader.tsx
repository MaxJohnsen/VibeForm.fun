import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export const InlineLoader = ({
  size = 'md',
  className,
}: InlineLoaderProps) => {
  return (
    <Loader2
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )}
    />
  );
};
