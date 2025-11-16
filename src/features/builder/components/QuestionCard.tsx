import { useState } from 'react';
import { GripVertical, Trash2, Mail, Phone, Calendar, Star } from 'lucide-react';
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
          {question.type === 'short_text' && (
            <Input
              placeholder="Your answer..."
              disabled
              className="opacity-50 border-border/50"
            />
          )}
          
          {question.type === 'long_text' && (
            <Textarea
              placeholder="Your answer..."
              disabled
              className="opacity-50 resize-none border-border/50"
              rows={2}
            />
          )}
          
          {question.type === 'multiple_choice' && (
            <div className="space-y-2">
              {['Option 1', 'Option 2', 'Option 3'].map((option, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 opacity-50">
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{option}</span>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'yes_no' && (
            <div className="flex gap-3">
              <button 
                disabled 
                className="flex-1 py-3 px-6 rounded-full border-2 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium opacity-50"
              >
                Yes
              </button>
              <button 
                disabled 
                className="flex-1 py-3 px-6 rounded-full border-2 border-border/30 bg-muted/5 text-muted-foreground font-medium opacity-50"
              >
                No
              </button>
            </div>
          )}
          
          {question.type === 'rating' && (
            <div className="flex items-center justify-between gap-2">
              {[...Array(10)].map((_, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center gap-1 opacity-50"
                >
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />
                  <span className="text-xs text-muted-foreground">{idx + 1}</span>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'email' && (
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <Input
                placeholder="email@example.com"
                disabled
                className="opacity-50 border-border/50 pl-10"
              />
            </div>
          )}
          
          {question.type === 'phone' && (
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <Input
                placeholder="(555) 123-4567"
                disabled
                className="opacity-50 border-border/50 pl-10"
              />
            </div>
          )}
          
          {question.type === 'date' && (
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
              <Input
                placeholder="MM/DD/YYYY"
                disabled
                className="opacity-50 border-border/50 pl-10"
              />
            </div>
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
