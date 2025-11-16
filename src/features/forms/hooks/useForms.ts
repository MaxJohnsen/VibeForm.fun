import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formsApi } from '../api/formsApi';
import { toast } from '@/hooks/use-toast';

const FORMS_QUERY_KEY = ['forms'];

export const useForms = () => {
  return useQuery({
    queryKey: FORMS_QUERY_KEY,
    queryFn: formsApi.fetchForms,
  });
};

export const useCreateForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: formsApi.createForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY });
      toast({ title: 'Form created successfully' });
    },
    onError: () => {
      toast({ 
        title: 'Failed to create form',
        variant: 'destructive'
      });
    },
  });
};

export const useUpdateForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<any> }) =>
      formsApi.updateForm(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY });
    },
    onError: () => {
      toast({ 
        title: 'Failed to update form',
        variant: 'destructive'
      });
    },
  });
};

export const useDeleteForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: formsApi.deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY });
      toast({ title: 'Form deleted' });
    },
    onError: () => {
      toast({ 
        title: 'Failed to delete form',
        variant: 'destructive'
      });
    },
  });
};
