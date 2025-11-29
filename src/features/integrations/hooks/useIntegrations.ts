import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  fetchIntegrationLogs,
  Integration,
} from '../api/integrationsApi';
import { useToast } from '@/hooks/use-toast';

export const useIntegrations = (formId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const integrationsQuery = useQuery({
    queryKey: ['integrations', formId],
    queryFn: () => fetchIntegrations(formId),
  });

  const createMutation = useMutation({
    mutationFn: createIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', formId] });
      toast({
        title: 'Action created',
        description: 'Your action has been created successfully.',
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

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Integration> }) =>
      updateIntegration(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', formId] });
      toast({
        title: 'Action updated',
        description: 'Your action has been updated successfully.',
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

  const deleteMutation = useMutation({
    mutationFn: deleteIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations', formId] });
      toast({
        title: 'Action deleted',
        description: 'Your action has been deleted successfully.',
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

  const testMutation = useMutation({
    mutationFn: testIntegration,
    onSuccess: () => {
      toast({
        title: 'Test successful',
        description: 'Your integration test was successful.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Test failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    integrations: integrationsQuery.data ?? [],
    isLoading: integrationsQuery.isLoading,
    createIntegration: createMutation.mutate,
    updateIntegration: updateMutation.mutate,
    deleteIntegration: deleteMutation.mutate,
    testIntegration: testMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTesting: testMutation.isPending,
  };
};

export const useIntegrationLogs = (integrationId: string) => {
  return useQuery({
    queryKey: ['integration-logs', integrationId],
    queryFn: () => fetchIntegrationLogs(integrationId),
    enabled: !!integrationId,
  });
};
