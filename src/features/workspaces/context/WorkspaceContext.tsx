import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workspacesApi, WorkspaceWithRole } from '../api/workspacesApi';
import { useAuth } from '@/features/auth/hooks/useAuth';

const ACTIVE_WORKSPACE_KEY = 'fairform_active_workspace';

interface WorkspaceContextType {
  workspaces: WorkspaceWithRole[];
  activeWorkspace: WorkspaceWithRole | null;
  setActiveWorkspace: (workspace: WorkspaceWithRole) => void;
  isLoading: boolean;
  userRole: 'admin' | 'member' | null;
  refetch: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [activeWorkspace, setActiveWorkspaceState] = useState<WorkspaceWithRole | null>(null);

  const { data: workspaces = [], isLoading: workspacesLoading, refetch } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspacesApi.fetchWorkspaces,
    enabled: !!user,
  });

  // Load active workspace from localStorage or set first workspace
  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspace) {
      const savedId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
      const savedWorkspace = savedId 
        ? workspaces.find(w => w.id === savedId) 
        : null;
      
      setActiveWorkspaceState(savedWorkspace || workspaces[0]);
    }
  }, [workspaces, activeWorkspace]);

  // Clear workspace when user logs out
  useEffect(() => {
    if (!user && !authLoading) {
      setActiveWorkspaceState(null);
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
    }
  }, [user, authLoading]);

  const setActiveWorkspace = (workspace: WorkspaceWithRole) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace.id);
  };

  const isLoading = authLoading || (!!user && workspacesLoading);
  const userRole = activeWorkspace?.role || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        isLoading,
        userRole,
        refetch,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspaceContext = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
};
