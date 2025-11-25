import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SettingsRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export const SettingsRow = ({
  label,
  description,
  children,
  className,
  fullWidth = false,
}: SettingsRowProps) => {
  return (
    <div className={cn('py-5 px-6', className)}>
      <div className={cn(
        'flex flex-col gap-3',
        !fullWidth && 'md:flex-row md:items-center md:justify-between'
      )}>
        <div className={cn('min-w-0', !fullWidth && 'md:flex-1 md:max-w-[200px]')}>
          <label className="text-sm font-semibold text-foreground block">
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        <div className={cn(
          'flex-shrink-0 w-full',
          !fullWidth && 'md:flex-1'
        )}>
          {children}
        </div>
      </div>
    </div>
  );
};
