import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SettingsSectionProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}

export const SettingsSection = ({
  icon: Icon,
  title,
  description,
  children,
  variant = 'default',
}: SettingsSectionProps) => {
  return (
    <div
      className={cn(
        'glass-panel rounded-xl p-4 md:p-6',
        variant === 'danger' && 'border-destructive/30 bg-destructive/5'
      )}
    >
      <div className="flex items-start gap-3 mb-4">
        <Icon
          className={cn(
            'h-5 w-5 mt-0.5 flex-shrink-0',
            variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'
          )}
        />
        <div className="flex-1 min-w-0">
          <h2
            className={cn(
              'font-semibold text-base',
              variant === 'danger' && 'text-destructive'
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
};
