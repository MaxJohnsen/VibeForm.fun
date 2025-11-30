import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  fetchIntegrationLogs,
  deleteIntegrationSecret,
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
    mutationFn: async (id: string) => {
      // First get the integration to find secret IDs
      const integration = integrationsQuery.data?.find(i => i.id === id);
      
      // Delete associated secrets from vault
      if (integration?.config) {
        const secretIds = [
          integration.config.customApiKeySecretId,
          integration.config.webhookUrlSecretId,
          integration.config.urlSecretId,
        ].filter(Boolean);
        
        for (const secretId of secretIds) {
          try {
            await deleteIntegrationSecret(id, secretId);
          } catch (error) {
            console.error('Error deleting secret:', error);
          }
        }
      }
      
      // Then delete the integration
      await deleteIntegration(id);
    },
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
