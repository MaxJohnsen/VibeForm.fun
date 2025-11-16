import { FileText, MessageSquare, TrendingUp, CheckCircle } from 'lucide-react';
import { GlassCard } from '@/shared/ui/GlassCard';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtitle: string;
  iconColor: string;
}

const StatCard = ({ icon: Icon, label, value, subtitle, iconColor }: StatCardProps) => {
  return (
    <GlassCard className="p-6">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`rounded-lg p-2 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-green-600 flex items-center gap-1">
        <TrendingUp className="h-3 w-3" />
        {subtitle}
      </div>
    </GlassCard>
  );
};

export const StatsPanel = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      <StatCard
        icon={FileText}
        label="Total Forms"
        value="24"
        subtitle="12% from last month"
        iconColor="bg-blue-100 text-blue-600"
      />
      <StatCard
        icon={MessageSquare}
        label="Total Responses"
        value="8,421"
        subtitle="28% from last month"
        iconColor="bg-purple-100 text-purple-600"
      />
      <StatCard
        icon={TrendingUp}
        label="Completion Rate"
        value="87%"
        subtitle="5% from last month"
        iconColor="bg-cyan-100 text-cyan-600"
      />
      <StatCard
        icon={CheckCircle}
        label="Active Forms"
        value="18"
        subtitle="75% of total forms"
        iconColor="bg-green-100 text-green-600"
      />
    </div>
  );
};
