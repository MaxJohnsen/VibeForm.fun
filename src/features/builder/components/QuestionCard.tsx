import { useState } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'relative glass-panel p-6 rounded-xl border transition-all duration-200 group',
          isSelected
            ? 'border-primary shadow-lg shadow-primary/20'
            : 'border-border/50 hover:border-border',
          isDragging && 'opacity-0',
          !isDragging && 'cursor-pointer'
        )}
        onClick={!isDragging ? onSelect : undefined}
      >
        {/* Action Buttons - Top Right */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none p-2 hover:bg-muted/50 rounded-lg h-8 w-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Question Number */}
        <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary mb-3">
          {index + 1}
        </div>

        {/* Question Label */}
        <div className="text-base font-medium text-foreground mb-4">
          {question.label}
        </div>
        
        {/* Preview Input */}
        <div>
          {question.type === 'short_text' ? (
            <Input
              placeholder="Your answer..."
              disabled
              className="opacity-50 border-border/50"
            />
          ) : (
            <Textarea
              placeholder="Your answer..."
              disabled
              className="opacity-50 resize-none border-border/50"
              rows={2}
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
