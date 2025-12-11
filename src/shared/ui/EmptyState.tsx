import { LucideIcon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type VariantProps } from 'class-variance-authority';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  buttonVariant?: VariantProps<typeof buttonVariants>['variant'];
  buttonClassName?: string;
  iconClassName?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  buttonVariant = 'default',
  buttonClassName,
  iconClassName,
}: EmptyStateProps) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in',
      className
    )}>
      <div className="rounded-full bg-coral/10 p-6 mb-6">
        <Icon className={cn('h-12 w-12 text-coral', iconClassName)} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-8 max-w-md leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button 
          onClick={onAction} 
          size="lg" 
          variant={buttonVariant}
          className={buttonClassName}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
