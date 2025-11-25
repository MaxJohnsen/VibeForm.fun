
import { QuestionCard } from './QuestionCard';
import { IntroCard } from './IntroCard';
import { EndCard } from './EndCard';
import { EmptyState } from '@/shared/ui/EmptyState';

import { Question } from '../api/questionsApi';
import { IntroSettings, EndSettings } from '../types/screenSettings';
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
  formTitle: string;
  introSettings: IntroSettings;
  endSettings: EndSettings;
  questions: Question[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
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
      className={`h-10 md:h-12 my-1 md:my-2 flex items-center justify-center transition-all duration-200 ${
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
  formTitle,
  introSettings,
  endSettings,
  questions,
  selectedItemId,
  onSelectItem,
  onDeleteQuestion,
  onReorderQuestions,
  onOpenLogic,
  activeId,
}: QuestionCanvasProps) => {

  const activeQuestion = questions.find((q) => q.id === activeId);
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
    <div className="flex-1 p-4 md:p-8 overflow-y-auto scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-3 md:space-y-4 animate-fade-in">
        {/* Intro Card - Always First */}
        <IntroCard
          formTitle={formTitle}
          settings={introSettings}
          isSelected={selectedItemId === 'intro'}
          onSelect={() => onSelectItem('intro')}
        />

        <SortableContext
          items={questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <DropZone id="drop-after-intro" position={0} isActive={showDropZones} />
          
          {questions.map((question, index) => (
            <div key={question.id}>
              <QuestionCard
                question={question}
                index={index}
                isSelected={selectedItemId === question.id}
                onSelect={() => onSelectItem(question.id)}
                onDelete={() => onDeleteQuestion(question.id)}
                onOpenLogic={onOpenLogic ? () => onOpenLogic(question.id) : undefined}
                allQuestions={questions}
              />
              <DropZone 
                id={`drop-after-${index}`} 
                position={index + 1} 
                isActive={showDropZones} 
              />
            </div>
          ))}
        </SortableContext>

        {/* End Card - Always Last */}
        <EndCard
          settings={endSettings}
          isSelected={selectedItemId === 'end'}
          onSelect={() => onSelectItem('end')}
        />

        <DragOverlay>
          {activeQuestion ? (
            <div className="opacity-80">
              <QuestionCard
                question={activeQuestion}
                index={0}
                isSelected={false}
                onSelect={() => {}}
                onDelete={() => {}}
                allQuestions={questions}
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
