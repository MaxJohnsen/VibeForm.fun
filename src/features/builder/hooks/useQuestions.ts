import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { builderApi } from '../api/builderApi';
import { QuestionType } from '../types/builder.types';
import { toast } from '@/hooks/use-toast';

export const questionsQueryKey = (formId: string) => ['questions', formId];

export const useQuestions = (formId: string) => {
  return useQuery({
    queryKey: questionsQueryKey(formId),
    queryFn: () => builderApi.fetchQuestions(formId),
    enabled: !!formId,
  });
};

export const useCreateQuestion = (formId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (type: QuestionType) => builderApi.createQuestion(formId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKey(formId) });
    },
    onError: () => {
      toast({ 
        title: 'Failed to add question',
        variant: 'destructive'
      });
    },
  });
};

export const useUpdateQuestion = (formId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<any> }) =>
      builderApi.updateQuestion(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKey(formId) });
    },
    onError: () => {
      toast({ 
        title: 'Failed to update question',
        variant: 'destructive'
      });
    },
  });
};

export const useDeleteQuestion = (formId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: builderApi.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKey(formId) });
      toast({ title: 'Question deleted' });
    },
    onError: () => {
      toast({ 
        title: 'Failed to delete question',
        variant: 'destructive'
      });
    },
  });
};

export const useReorderQuestions = (formId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (questionIds: string[]) => builderApi.reorderQuestions(formId, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKey(formId) });
    },
    onError: () => {
      toast({ 
        title: 'Failed to reorder questions',
        variant: 'destructive'
      });
    },
  });
};
