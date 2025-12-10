import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';
import { PageLoader } from '@/shared/ui';

/**
 * A route wrapper that only requires authentication (no workspace check).
 * Used for routes like onboarding where user doesn't have a workspace yet.
 */
export const AuthRequiredRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) return null;

  return <>{children}</>;
};
