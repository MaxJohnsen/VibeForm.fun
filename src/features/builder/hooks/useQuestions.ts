import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi, CreateQuestionData, UpdateQuestionData } from '../api/questionsApi';
import { useToast } from '@/hooks/use-toast';

export const useQuestions = (formId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const questionsQuery = useQuery({
    queryKey: ['questions', formId],
    queryFn: () => questionsApi.fetchQuestions(formId),
    enabled: !!formId,
  });

  const createQuestionMutation = useMutation({
    mutationFn: (data: CreateQuestionData) => questionsApi.createQuestion(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', formId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionData }) =>
      questionsApi.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', formId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => questionsApi.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', formId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const reorderQuestionsMutation = useMutation({
    mutationFn: (updates: { id: string; position: number }[]) =>
      questionsApi.reorderQuestions(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions', formId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    questions: questionsQuery.data || [],
    isLoading: questionsQuery.isLoading,
    error: questionsQuery.error,
    createQuestion: createQuestionMutation.mutateAsync,
    updateQuestion: updateQuestionMutation.mutate,
    deleteQuestion: deleteQuestionMutation.mutateAsync,
    reorderQuestions: reorderQuestionsMutation.mutate,
  };
};
