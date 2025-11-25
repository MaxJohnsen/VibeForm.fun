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
        'glass-panel rounded-2xl p-6 space-y-4',
        variant === 'danger' && 'border-destructive/20 bg-destructive/5'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            'h-5 w-5 mt-0.5',
            variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'
          )}
        />
        <div className="flex-1">
          <h3
            className={cn(
              'font-semibold text-base',
              variant === 'danger' && 'text-destructive'
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="pl-8 space-y-4">{children}</div>
    </div>
  );
};
