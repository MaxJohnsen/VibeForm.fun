import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/shared/ui';

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
    <GlassCard 
      className={cn('p-5 md:p-6', className)}
      hover
    >
      <div className="flex flex-row items-center md:items-start gap-4 md:gap-0 md:block">
        <div className="flex items-start justify-between md:mb-4 shrink-0">
          <div className="rounded-xl bg-primary/10 p-3 shadow-sm w-fit">
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
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
        
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div className="text-3xl md:text-4xl font-bold tracking-tight truncate">{value}</div>
            {trend && (
              <div className={cn(
                'text-xs font-medium md:hidden',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.value}
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-muted-foreground truncate">{label}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground/60 pt-0.5 truncate">{subtitle}</div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
