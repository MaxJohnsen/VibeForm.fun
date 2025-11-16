import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi, CreateFormData, UpdateFormData } from '../api/formsApi';
import { useToast } from '@/hooks/use-toast';

export const useForms = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const formsQuery = useQuery({
    queryKey: ['forms'],
    queryFn: formsApi.fetchForms,
  });

  const createFormMutation = useMutation({
    mutationFn: (data: CreateFormData) => formsApi.createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: 'Success',
        description: 'Form created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFormData }) =>
      formsApi.updateForm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: (id: string) => formsApi.deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
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
    forms: formsQuery.data || [],
    isLoading: formsQuery.isLoading,
    error: formsQuery.error,
    createForm: createFormMutation.mutateAsync,
    updateForm: updateFormMutation.mutate,
    deleteForm: deleteFormMutation.mutate,
  };
};
