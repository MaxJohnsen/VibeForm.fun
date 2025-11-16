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

export const FormBuilderPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
  } = useQuestions(formId!);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  useEffect(() => {
    if (questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  const handleAddQuestion = async (type: string) => {
    setIsSaving(true);
    try {
      const newQuestion = await createQuestion({
        type: type as QuestionType,
        label: `New ${type.replace('_', ' ')} question`,
        position: questions.length,
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

  const handleUpdateLabel = useCallback(
    (label: string) => {
      if (!selectedQuestionId) return;
      debouncedUpdate(selectedQuestionId, label);
    },
    [selectedQuestionId, debouncedUpdate]
  );

  const handleDeleteQuestion = (id: string) => {
    if (selectedQuestionId === id) {
      const index = questions.findIndex((q) => q.id === id);
      const nextQuestion = questions[index + 1] || questions[index - 1];
      setSelectedQuestionId(nextQuestion?.id || null);
    }
    deleteQuestion(id);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <BuilderTopBar form={form || null} isSaving={isSaving} />
      
      <div className="flex-1 flex overflow-hidden">
        <QuestionTypePalette onSelectType={handleAddQuestion} />
        
        <QuestionCanvas
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={setSelectedQuestionId}
          onDeleteQuestion={handleDeleteQuestion}
        />
        
        <PropertiesPanel
          question={selectedQuestion || null}
          onUpdateLabel={handleUpdateLabel}
        />
      </div>
    </div>
  );
};
