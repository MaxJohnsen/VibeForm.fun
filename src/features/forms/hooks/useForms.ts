import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi, CreateFormData, UpdateFormData, Form } from '../api/formsApi';
import { useToast } from '@/hooks/use-toast';
import { useWorkspaceContext } from '@/features/workspaces';

export const useForms = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspaceContext();

  const formsQuery = useQuery({
    queryKey: ['forms', activeWorkspace?.id],
    queryFn: () => formsApi.fetchForms(activeWorkspace?.id),
    enabled: !!activeWorkspace,
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
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', id] });
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
    forms: (formsQuery.data || []) as Form[],
    isLoading: formsQuery.isLoading,
    error: formsQuery.error,
    createForm: createFormMutation.mutateAsync,
    updateForm: updateFormMutation.mutate,
    deleteForm: deleteFormMutation.mutate,
    activeWorkspaceId: activeWorkspace?.id,
  };
};
