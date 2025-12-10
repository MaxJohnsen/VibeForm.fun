import { Area, AreaChart, ResponsiveContainer } from 'recharts';

interface FormSparklineProps {
  data: number[];
}

export const FormSparkline = ({ data }: FormSparklineProps) => {
  const chartData = data.map((value, index) => ({ value, index }));
  
  // Don't render if all zeros
  const hasData = data.some(v => v > 0);
  
  if (!hasData) {
    return (
      <div className="w-20 h-8 flex items-center justify-center">
        <div className="flex gap-0.5">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className="w-1.5 h-1 rounded-full bg-muted-foreground/20" 
            />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={1.5}
            fill="url(#sparklineGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
