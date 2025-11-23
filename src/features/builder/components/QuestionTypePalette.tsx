import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';

interface QuestionTypePaletteProps {
  onSelectType: (type: string) => void;
  className?: string;
}

const DraggableQuestionType = ({
  questionType,
  onSelectType
}: {
  questionType: typeof QUESTION_TYPES[0],
  onSelectType: (type: string) => void
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${questionType.type}`,
    data: {
      type: questionType.type,
      source: 'palette',
    },
  });

  const Icon = questionType.icon;

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onSelectType(questionType.type)}
      className={cn(
        'w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50'
      )}
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
};

export const QuestionTypePalette = ({ onSelectType, className }: QuestionTypePaletteProps) => {
  return (
    <div className={cn("w-64 border-r border-border/50 glass-panel p-6 overflow-y-auto", className)}>
      <div className="mb-4">
        <h2 className="font-semibold">Question Types</h2>
        <p className="text-xs text-muted-foreground mt-1">Drag or tap to add</p>
      </div>
      <div className="space-y-2">
        {QUESTION_TYPES.map((questionType) => (
          <DraggableQuestionType
            key={questionType.type}
            questionType={questionType}
            onSelectType={onSelectType}
          />
        ))}
      </div>
    </div>
  );
};
