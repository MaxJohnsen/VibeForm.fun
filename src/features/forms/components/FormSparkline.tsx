import { Bar, BarChart, ResponsiveContainer } from 'recharts';

interface FormSparklineProps {
  data: number[];
}

export const FormSparkline = ({ data }: FormSparklineProps) => {
  // Ensure we always have 6 bars (weeks)
  const normalizedData = [...Array(6)].map((_, i) => ({
    value: data[i] || 0,
    index: i,
  }));
  
  // Don't render chart if all zeros
  const hasData = normalizedData.some(d => d.value > 0);
  
  if (!hasData) {
    return (
      <div className="w-20 h-8 flex items-center justify-center">
        <div className="flex gap-1 items-end">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="w-2.5 h-2 rounded-sm bg-muted-foreground/20" 
            />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={normalizedData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Bar
            dataKey="value"
            fill="hsl(var(--primary))"
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
