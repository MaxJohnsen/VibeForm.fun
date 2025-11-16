import { QuestionTypeConfig } from '../types/builder.types';
import { cn } from '@/lib/utils';

interface QuestionTypeButtonProps {
  config: QuestionTypeConfig;
  onClick: () => void;
}

export const QuestionTypeButton = ({ config, onClick }: QuestionTypeButtonProps) => {
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 rounded-lg text-left transition-all duration-200',
        'bg-background border border-border',
        'hover:border-primary/50 hover-elevate',
        'group'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-foreground mb-1">
            {config.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {config.description}
          </div>
        </div>
      </div>
    </button>
  );
};
