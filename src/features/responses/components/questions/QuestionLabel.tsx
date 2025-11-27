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
  <h2 className={cn(
    "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground",
    centered && "text-center"
  )}>
    {label}
    {!isRequired && (
      <span className="text-base sm:text-lg text-muted-foreground ml-2 font-normal italic">
        · {optionalText}
      </span>
    )}
  </h2>
);
