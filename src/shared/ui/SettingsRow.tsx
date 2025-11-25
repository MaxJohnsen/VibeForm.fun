import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SettingsRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export const SettingsRow = ({
  label,
  description,
  children,
  className,
}: SettingsRowProps) => {
  return (
    <div className={cn('py-4 px-5', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <label className="text-sm font-medium text-foreground block">
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex-shrink-0 w-full md:w-auto md:max-w-xs">
          {children}
        </div>
      </div>
    </div>
  );
};
