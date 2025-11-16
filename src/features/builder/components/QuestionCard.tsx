import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Question } from '../api/questionsApi';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: question.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative glass-panel p-8 rounded-2xl border transition-all duration-200 group',
        isSelected
          ? 'border-primary shadow-lg shadow-primary/20'
          : 'border-border/50 hover:border-border',
        isDragging && 'opacity-0',
        !isDragging && 'cursor-pointer'
      )}
      onClick={!isDragging ? onSelect : undefined}
    >
      {/* Drag Handle - Top Right Corner */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none p-2 hover:bg-muted/50 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* Delete Button - Top Right, appears on hover */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-4 right-14 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      {/* Question Number */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary mb-6">
        {index + 1}
      </div>

      {/* Question Label */}
      <div className="text-xl font-medium text-foreground mb-8">
        {question.label}
      </div>
      
      {/* Preview Input */}
      <div className="mt-4">
        {question.type === 'short_text' ? (
          <Input
            placeholder="Your answer..."
            disabled
            className="opacity-50 text-base border-border/50"
          />
        ) : (
          <Textarea
            placeholder="Your answer..."
            disabled
            className="opacity-50 resize-none text-base border-border/50"
            rows={3}
          />
        )}
      </div>
    </div>
  );
};
