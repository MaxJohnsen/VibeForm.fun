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
    <div className={cn('glass-panel rounded-xl p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
          <div className={cn(
            'text-sm font-medium',
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.value}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground/70">{subtitle}</div>
        )}
      </div>
    </div>
  );
};
