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
        'bg-card rounded-xl p-8 border border-border/50',
        variant === 'danger' && 'border-destructive/30 bg-destructive/5'
      )}
    >
      <div className="flex items-start gap-4 mb-6">
        <Icon
          className={cn(
            'h-5 w-5 mt-0.5 flex-shrink-0',
            variant === 'danger' ? 'text-destructive' : 'text-muted-foreground'
          )}
        />
        <div className="flex-1">
          <h2
            className={cn(
              'font-semibold text-lg',
              variant === 'danger' && 'text-destructive'
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};
