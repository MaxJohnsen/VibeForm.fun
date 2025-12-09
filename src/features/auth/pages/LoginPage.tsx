import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Show confirmation message if user just confirmed their email
  useEffect(() => {
    const confirmed = searchParams.get('confirmed');
    if (confirmed === 'true') {
      toast({
        title: 'Email confirmed!',
        description: 'You can now sign in to your account.',
      });
      // Clean up the URL
      window.history.replaceState({}, '', ROUTES.LOGIN);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (!loading && user) {
      navigate(ROUTES.HOME);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthCard
      title=""
      subtitle="Sign in to continue building amazing forms"
    >
      <LoginForm />
    </AuthCard>
  );
};

export default LoginPage;
