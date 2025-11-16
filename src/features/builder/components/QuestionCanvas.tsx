import { useState, useEffect, useRef } from 'react';
import { QuestionCard } from './QuestionCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FlowArrows } from './FlowArrows';
import { Question } from '../api/questionsApi';
import { FileQuestion, MousePointer2 } from 'lucide-react';
import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface QuestionCanvasProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestions: (questions: Question[]) => void;
  onOpenLogic?: (questionId: string) => void;
  activeId: string | null;
}

const DropZone = ({ 
  id, 
  position, 
  isActive 
}: { 
  id: string; 
  position: 'start' | 'end' | number;
  isActive: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { position },
  });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className={`h-12 my-2 flex items-center justify-center transition-all duration-200 ${
        isOver 
          ? 'bg-primary/10 border-2 border-dashed border-primary rounded-xl' 
          : 'border-2 border-dashed border-transparent'
      }`}
    >
      {isOver && (
        <div className="flex items-center gap-2 text-sm text-primary font-medium">
          <MousePointer2 className="h-4 w-4" />
          Drop here
        </div>
      )}
    </div>
  );
};

export const QuestionCanvas = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onOpenLogic,
  activeId,
}: QuestionCanvasProps) => {
  const [items, setItems] = useState(questions);
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync items with questions when questions change from parent
  useEffect(() => {
    const questionIds = questions.map(q => q.id).join(',');
    const itemIds = items.map(q => q.id).join(',');
    
    // Only update if the questions actually changed
    if (questionIds !== itemIds) {
      setItems(questions);
    }
  }, [questions, items]);

  const activeQuestion = items.find((q) => q.id === activeId);
  const isDraggingFromPalette = activeId?.startsWith('palette-');
  const showDropZones = isDraggingFromPalette;

  const { setNodeRef: setEmptyDropRef, isOver: isOverEmpty } = useDroppable({
    id: 'empty-canvas',
    data: { position: 0 },
  });

  if (questions.length === 0) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <div 
          ref={setEmptyDropRef}
          className={`max-w-3xl mx-auto min-h-[400px] rounded-2xl border-2 border-dashed transition-all duration-200 flex items-center justify-center ${
            isOverEmpty 
              ? 'border-primary bg-primary/10' 
              : 'border-border/50 bg-muted/20'
          }`}
        >
          <EmptyState
            icon={isDraggingFromPalette ? MousePointer2 : FileQuestion}
            title={isDraggingFromPalette ? "Drop here to add" : "No questions yet"}
            description={isDraggingFromPalette ? "Release to create your first question" : "Drag a question type from the left or click to add"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto" ref={canvasRef}>
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in relative">
        {/* Flow Arrows Overlay */}
        <FlowArrows 
          questions={items} 
          containerRef={canvasRef}
          hoveredQuestionId={hoveredQuestionId}
        />

        <SortableContext
          items={items.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <DropZone id="drop-start" position="start" isActive={showDropZones} />
          
          {items.map((question, index) => (
            <div 
              key={question.id}
              data-question-id={question.id}
              onMouseEnter={() => setHoveredQuestionId(question.id)}
              onMouseLeave={() => setHoveredQuestionId(null)}
            >
              <QuestionCard
                question={question}
                index={index}
                isSelected={selectedQuestionId === question.id}
                onSelect={() => onSelectQuestion(question.id)}
                onDelete={() => onDeleteQuestion(question.id)}
                onOpenLogic={onOpenLogic ? () => onOpenLogic(question.id) : undefined}
              />
              <DropZone 
                id={`drop-after-${index}`} 
                position={index + 1} 
                isActive={showDropZones} 
              />
            </div>
          ))}
        </SortableContext>

        <DragOverlay>
          {activeQuestion ? (
            <div className="opacity-80">
              <QuestionCard
                question={activeQuestion}
                index={0}
                isSelected={false}
                onSelect={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : isDraggingFromPalette ? (
            <div className="glass-panel p-6 rounded-xl border-2 border-primary shadow-2xl shadow-primary/30 opacity-90">
              <div className="flex items-center gap-3 text-primary font-medium">
                <MousePointer2 className="h-5 w-5" />
                <span>New Question</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </div>
  );
};
