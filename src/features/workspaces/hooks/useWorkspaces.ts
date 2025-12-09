import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi, CreateWorkspaceData } from '../api/workspacesApi';
import { useToast } from '@/hooks/use-toast';

export const useWorkspaces = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const workspacesQuery = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspacesApi.fetchWorkspaces,
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: (data: CreateWorkspaceData) => workspacesApi.createWorkspace(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast({
        title: 'Success',
        description: 'Workspace created successfully',
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

  const updateWorkspaceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateWorkspaceData> }) =>
      workspacesApi.updateWorkspace(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast({
        title: 'Success',
        description: 'Workspace updated successfully',
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

  const deleteWorkspaceMutation = useMutation({
    mutationFn: (id: string) => workspacesApi.deleteWorkspace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast({
        title: 'Success',
        description: 'Workspace deleted successfully',
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
    workspaces: workspacesQuery.data || [],
    isLoading: workspacesQuery.isLoading,
    error: workspacesQuery.error,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    updateWorkspace: updateWorkspaceMutation.mutate,
    deleteWorkspace: deleteWorkspaceMutation.mutate,
    isCreating: createWorkspaceMutation.isPending,
  };
};
