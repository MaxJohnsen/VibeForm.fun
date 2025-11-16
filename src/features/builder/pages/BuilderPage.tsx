import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BuilderTopBar } from '../components/BuilderTopBar';
import { BuilderLayout } from '../components/BuilderLayout';
import { QuestionPalette } from '../components/QuestionPalette';
import { QuestionCanvas } from '../components/QuestionCanvas';
import { PropertiesPanel } from '../components/PropertiesPanel';
import { LoadingSpinner } from '@/shared/ui';
import { 
  useQuestions, 
  useCreateQuestion, 
  useUpdateQuestion, 
  useDeleteQuestion 
} from '../hooks/useQuestions';
import { formsApi } from '@/features/forms/api/formsApi';
import { useUpdateForm } from '@/features/forms/hooks/useForms';
import { QuestionType } from '../types/builder.types';
import { ROUTES } from '@/shared/constants/routes';
import { toast } from '@/hooks/use-toast';

export const BuilderPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.fetchFormById(formId!),
    enabled: !!formId,
  });

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuestions(formId!);
  const createQuestion = useCreateQuestion(formId!);
  const updateQuestion = useUpdateQuestion(formId!);
  const deleteQuestion = useDeleteQuestion(formId!);
  const updateForm = useUpdateForm();

  useEffect(() => {
    if (!formId) {
      toast({ title: 'Form ID is required', variant: 'destructive' });
      navigate(ROUTES.HOME);
    }
  }, [formId, navigate]);

  const handleAddQuestion = async (type: QuestionType) => {
    const newQuestion = await createQuestion.mutateAsync(type);
    setSelectedQuestionId(newQuestion.id);
  };

  const handleUpdateQuestion = (updates: Partial<any>) => {
    if (!selectedQuestionId) return;
    
    setIsSaving(true);
    updateQuestion.mutate(
      { id: selectedQuestionId, updates },
      {
        onSettled: () => {
          setTimeout(() => setIsSaving(false), 500);
        },
      }
    );
  };

  const handleDeleteQuestion = (id: string) => {
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
    deleteQuestion.mutate(id);
  };

  const handleUpdateTitle = (title: string) => {
    if (!formId) return;
    
    setIsSaving(true);
    updateForm.mutate(
      { id: formId, updates: { title } },
      {
        onSettled: () => {
          setTimeout(() => setIsSaving(false), 500);
        },
      }
    );
  };

  if (isLoadingForm || isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!form) {
    return null;
  }

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <BuilderTopBar
        formTitle={form.title}
        onUpdateTitle={handleUpdateTitle}
        isSaving={isSaving}
      />
      
      <BuilderLayout
        palette={<QuestionPalette onAddQuestion={handleAddQuestion} />}
        canvas={
          <QuestionCanvas
            questions={questions}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
            onDeleteQuestion={handleDeleteQuestion}
          />
        }
        properties={
          <PropertiesPanel
            question={selectedQuestion}
            onUpdateQuestion={handleUpdateQuestion}
          />
        }
      />
    </div>
  );
};
