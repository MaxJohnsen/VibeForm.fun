import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatisticsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatisticsCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  className,
}: StatisticsCardProps) => {
  return (
    <div className={cn('glass-panel rounded-xl p-4 md:p-6', className)}>
      <div className="flex flex-row items-center md:items-start gap-4 md:gap-0 md:block">
        <div className="flex items-start justify-between md:mb-4 shrink-0">
          <div className="rounded-lg bg-primary/10 p-2 md:p-3">
            <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          {trend && (
            <div className={cn(
              'text-sm font-medium hidden md:block',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.value}
            </div>
          )}
        </div>
        
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="text-2xl md:text-3xl font-bold truncate">{value}</div>
            {trend && (
              <div className={cn(
                'text-xs font-medium md:hidden',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.value}
              </div>
            )}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground truncate">{label}</div>
          {subtitle && (
            <div className="text-[10px] md:text-xs text-muted-foreground/70 truncate">{subtitle}</div>
          )}
        </div>
      </div>
    </div>
  );
};
