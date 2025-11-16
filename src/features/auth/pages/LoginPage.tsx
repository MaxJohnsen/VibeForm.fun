import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
      title="Welcome back"
      subtitle="Sign in to continue building amazing forms"
    >
      <LoginForm />
    </AuthCard>
  );
};

export default LoginPage;
