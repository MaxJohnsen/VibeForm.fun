import { Bar, BarChart, ResponsiveContainer } from 'recharts';

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
        <div className="flex gap-1 items-end">
          {[...Array(7)].map((_, i) => (
            <div 
              key={i} 
              className="w-2 h-2 rounded-sm bg-muted-foreground/20" 
            />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-20 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
