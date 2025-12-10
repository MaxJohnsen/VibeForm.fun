import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspaceContext } from '@/features/workspaces';
import { ROUTES } from '@/shared/constants/routes';
import { PageLoader } from '@/shared/ui';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { workspaces, isLoading: workspacesLoading, activeWorkspace } = useWorkspaceContext();
  const navigate = useNavigate();

  const isLoading = authLoading || (user && workspacesLoading);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    // If user is authenticated but has no workspaces, redirect to onboarding
    if (user && !workspacesLoading && workspaces.length === 0) {
      navigate(ROUTES.ONBOARDING);
      return;
    }
  }, [user, authLoading, workspaces, workspacesLoading, navigate]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) return null;

  // Wait for workspace to be available before rendering children
  if (workspaces.length > 0 && !activeWorkspace) {
    return <PageLoader />;
  }

  return <>{children}</>;
};
