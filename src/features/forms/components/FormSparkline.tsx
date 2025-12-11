interface FormSparklineProps {
  data: number[];
}

export const FormSparkline = ({ data }: FormSparklineProps) => {
  // Ensure we always have 7 bars (weeks)
  const normalizedData = [...Array(7)].map((_, i) => data[i] || 0);
  
  // Find max value for proportional scaling
  const maxValue = Math.max(...normalizedData, 1);
  
  return (
    <div className="w-20 h-8 flex items-center justify-center">
      <div className="flex gap-1 items-end h-full py-1">
        {normalizedData.map((value, i) => (
          value > 0 ? (
            <div 
              key={i}
              className="w-2 rounded-sm bg-primary"
              style={{ 
                height: `${Math.max((value / maxValue) * 100, 16)}%`,
              }}
            />
          ) : (
            <div 
              key={i} 
              className="w-2 h-2 rounded-sm bg-muted-foreground/20 self-end" 
            />
          )
        ))}
      </div>
    </div>
  );
};
