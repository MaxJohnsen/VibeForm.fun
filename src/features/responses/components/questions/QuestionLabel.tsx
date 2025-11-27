import { cn } from '@/lib/utils';

interface QuestionLabelProps {
  label: string;
  isRequired: boolean;
  optionalText: string;
  centered?: boolean;
}

export const QuestionLabel = ({ 
  label, 
  isRequired, 
  optionalText, 
  centered = false 
}: QuestionLabelProps) => (
  <div className={cn("space-y-2", centered && "text-center")}>
    {!isRequired && (
      <span className="inline-block text-xs sm:text-sm text-muted-foreground/80 font-medium tracking-wide uppercase">
        {optionalText}
      </span>
    )}
    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
      {label}
    </h2>
  </div>
);
