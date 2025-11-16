import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '../api/questionsApi';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const QuestionCard = ({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
}: QuestionCardProps) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'glass-panel p-6 rounded-xl border cursor-pointer transition-all duration-200 group',
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20'
          : 'border-border/50 hover:border-border'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Question Number */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
          {index + 1}
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-3">{question.label}</div>
          
          {/* Preview Input */}
          {question.type === 'short_text' ? (
            <Input
              placeholder="Short text answer..."
              disabled
              className="opacity-50"
            />
          ) : (
            <Textarea
              placeholder="Long text answer..."
              disabled
              className="opacity-50 resize-none"
              rows={3}
            />
          )}
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};
