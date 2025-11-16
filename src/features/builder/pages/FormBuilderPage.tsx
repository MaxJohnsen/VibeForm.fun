import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BuilderTopBar } from '../components/BuilderTopBar';
import { QuestionTypePalette } from '../components/QuestionTypePalette';
import { QuestionCanvas } from '../components/QuestionCanvas';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { useQuestions } from '../hooks/useQuestions';
import { formsApi } from '@/features/forms/api/formsApi';
import { QuestionType } from '@/shared/constants/questionTypes';
import { debounce } from '@/shared/utils/debounce';
import { getDefaultSettings } from '../types/questionSettings';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

export const FormBuilderPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tempQuestions, setTempQuestions] = useState<any[]>([]);

  const { data: form } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  const {
    questions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
  } = useQuestions(formId!);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  useEffect(() => {
    setTempQuestions(questions);
  }, [questions]);

  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddQuestion = async (type: string, position?: number) => {
    setIsSaving(true);
    try {
      const questionType = type as QuestionType;
      const targetPosition = position !== undefined ? position : questions.length;
      
      // Reorder existing questions first if inserting in the middle
      if (position !== undefined && position < questions.length) {
        const updates = questions
          .filter((q) => q.position >= position)
          .map((q) => ({
            id: q.id,
            position: q.position + 1,
          }));
        if (updates.length > 0) {
          await reorderQuestions(updates);
        }
      }
      
      const newQuestion = await createQuestion({
        type: questionType,
        label: `New ${type.replace('_', ' ')} question`,
        position: targetPosition,
        settings: getDefaultSettings(questionType),
      });
      
      setSelectedQuestionId(newQuestion.id);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save function - only saves after user stops typing for 800ms
  const debouncedUpdate = useMemo(
    () =>
      debounce((id: string, label: string) => {
        setIsSaving(true);
        updateQuestion(
          { id, data: { label } },
          {
            onSettled: () => {
              setTimeout(() => setIsSaving(false), 300);
            },
          }
        );
      }, 800),
    [updateQuestion]
  );

  // Debounced settings update
  const debouncedSettingsUpdate = useMemo(
    () =>
      debounce((id: string, settings: Record<string, any>) => {
        setIsSaving(true);
        updateQuestion(
          { id, data: { settings } },
          {
            onSettled: () => {
              setTimeout(() => setIsSaving(false), 300);
            },
          }
        );
      }, 800),
    [updateQuestion]
  );

  const handleUpdateLabel = useCallback(
    (label: string) => {
      if (!selectedQuestionId) return;
      debouncedUpdate(selectedQuestionId, label);
    },
    [selectedQuestionId, debouncedUpdate]
  );

  const handleUpdateSettings = useCallback(
    (settings: Record<string, any>) => {
      if (!selectedQuestionId) return;
      debouncedSettingsUpdate(selectedQuestionId, settings);
    },
    [selectedQuestionId, debouncedSettingsUpdate]
  );

  const handleDeleteQuestion = (id: string) => {
    if (selectedQuestionId === id) {
      const index = questions.findIndex((q) => q.id === id);
      const nextQuestion = questions[index + 1] || questions[index - 1];
      setSelectedQuestionId(nextQuestion?.id || null);
    }
    deleteQuestion(id);
  };

  const handleReorderQuestions = (reorderedQuestions: typeof questions) => {
    const updates = reorderedQuestions.map((q, index) => ({
      id: q.id,
      position: index,
    }));
    reorderQuestions(updates);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Only handle reordering if dragging a question (not from palette)
    if (!active.id.toString().startsWith('palette-')) {
      if (active.id !== over.id) {
        setTempQuestions((items) => {
          const oldIndex = items.findIndex((q) => q.id === active.id);
          const newIndex = items.findIndex((q) => q.id === over.id);
          
          if (oldIndex === -1 || newIndex === -1) return items;
          
          const newItems = [...items];
          const [removed] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, removed);
          return newItems;
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over) {
      setTempQuestions(questions);
      return;
    }

    // Handle dropping from palette
    if (active.id.toString().startsWith('palette-')) {
      const questionType = active.data.current?.type;
      if (!questionType) return;

      let position = 0;
      
      // Determine position based on drop target
      if (over.id === 'empty-canvas') {
        position = 0;
      } else if (over.id === 'drop-start') {
        position = 0;
      } else if (over.id.toString().startsWith('drop-after-')) {
        // Get the actual array index from the drop zone ID
        const arrayIndex = parseInt(over.id.toString().replace('drop-after-', ''));
        // Position should be after this question
        position = arrayIndex + 1;
      } else {
        // Dropped on a question - insert after it
        const targetQuestion = questions.find((q) => q.id === over.id);
        if (targetQuestion) {
          // Find the index in the sorted array
          const sortedQuestions = [...questions].sort((a, b) => a.position - b.position);
          const targetIndex = sortedQuestions.findIndex((q) => q.id === targetQuestion.id);
          position = targetIndex + 1;
        } else {
          position = questions.length;
        }
      }

      await handleAddQuestion(questionType, position);
    } else {
      // Handle reordering existing questions
      const originalIds = questions.map((q) => q.id).join('|');
      const newIds = tempQuestions.map((q) => q.id).join('|');

      if (originalIds !== newIds) {
        handleReorderQuestions(tempQuestions);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setTempQuestions(questions);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <BuilderTopBar 
        form={form || null} 
        isSaving={isSaving}
      />
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex-1 flex overflow-hidden">
          <QuestionTypePalette onSelectType={handleAddQuestion} />
          
          <QuestionCanvas
            questions={tempQuestions}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
            onDeleteQuestion={handleDeleteQuestion}
            onReorderQuestions={handleReorderQuestions}
            activeId={activeId}
          />

          {selectedQuestion && (
            <PropertiesPanel
              question={selectedQuestion}
              onUpdateLabel={handleUpdateLabel}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </div>
      </DndContext>
    </div>
  );
};
