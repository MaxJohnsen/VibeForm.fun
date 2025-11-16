import { Trash2, GripVertical, Type, TextCursor } from 'lucide-react';
import { Question } from '../types/builder.types';
import { IconButton } from '@/shared/ui/IconButton';
import { cn } from '@/lib/utils';

interface QuestionItemProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const typeIcons = {
  short_text: TextCursor,
  long_text: Type,
};

const typeBadges = {
  short_text: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  long_text: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export const QuestionItem = ({ 
  question, 
  isSelected, 
  onSelect, 
  onDelete 
}: QuestionItemProps) => {
  const Icon = typeIcons[question.type];

  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 rounded-lg border transition-all duration-200 cursor-pointer',
        'bg-background hover-elevate',
        isSelected 
          ? 'border-primary shadow-sm' 
          : 'border-border hover:border-primary/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-muted-foreground cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
              typeBadges[question.type]
            )}>
              <Icon className="w-3 h-3" />
              {question.type === 'short_text' ? 'Short Text' : 'Long Text'}
            </span>
          </div>
          
          <div className="text-sm font-medium text-foreground">
            {question.label}
          </div>
          
          {question.placeholder && (
            <div className="text-xs text-muted-foreground mt-1">
              Placeholder: {question.placeholder}
            </div>
          )}
        </div>

        <IconButton
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete question"
        >
          <Trash2 className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  );
};
