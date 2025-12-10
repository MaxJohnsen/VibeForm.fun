import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PageLoaderProps {
  text?: string;
  variant?: 'default' | 'overlay';
  className?: string;
}

export const PageLoader = ({
  text,
  variant = 'default',
  className,
}: PageLoaderProps) => {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center gap-3',
        variant === 'overlay' && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
        variant === 'default' && 'bg-background',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};
