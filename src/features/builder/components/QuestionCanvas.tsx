import { useState } from 'react';
import { QuestionCard } from './QuestionCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Question } from '../api/questionsApi';
import { FileQuestion } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
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
}

export const QuestionCanvas = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onDeleteQuestion,
  onReorderQuestions,
}: QuestionCanvasProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState(questions);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Requires 8px movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setItems(questions);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((q) => q.id === active.id);
        const newIndex = items.findIndex((q) => q.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      onReorderQuestions(reorderedQuestions);
    }
    
    setActiveId(null);
    setItems(questions);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setItems(questions);
  };

  const displayItems = activeId ? items : questions;
  const activeQuestion = questions.find((q) => q.id === activeId);
  if (questions.length === 0) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <EmptyState
          icon={FileQuestion}
          title="No questions yet"
          description="Click on a question type from the left panel to add your first question"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={displayItems.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {displayItems.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                index={index}
                isSelected={selectedQuestionId === question.id}
                onSelect={() => onSelectQuestion(question.id)}
                onDelete={() => onDeleteQuestion(question.id)}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeQuestion ? (
              <div className="glass-panel p-6 rounded-xl border border-primary shadow-2xl shadow-primary/30 opacity-90">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {displayItems.findIndex((q) => q.id === activeQuestion.id) + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{activeQuestion.label}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
