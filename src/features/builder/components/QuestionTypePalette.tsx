import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { cn } from '@/lib/utils';

interface QuestionTypePaletteProps {
  onSelectType: (type: string) => void;
}

export const QuestionTypePalette = ({ onSelectType }: QuestionTypePaletteProps) => {
  return (
    <div className="w-64 border-r border-border/50 glass-panel p-6 overflow-y-auto">
      <h2 className="font-semibold mb-4">Question Types</h2>
      <div className="space-y-2">
        {QUESTION_TYPES.map((questionType) => {
          const Icon = questionType.icon;
          return (
            <button
              key={questionType.type}
              onClick={() => onSelectType(questionType.type)}
              className="w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'rounded-lg p-2 transition-colors',
                  questionType.colorClass
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {questionType.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {questionType.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
