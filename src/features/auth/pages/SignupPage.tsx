import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthCard } from '../components/AuthCard';
import { SignupForm } from '../components/SignupForm';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '@/shared/constants/routes';

const SignupPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invitedEmail = searchParams.get('email') || '';

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
      title="Create your account"
      subtitle={invitedEmail 
        ? "Sign up to accept your workspace invitation" 
        : "Create beautiful forms for free – no limits, no cost"
      }
    >
      <SignupForm defaultEmail={invitedEmail} isEmailLocked={!!invitedEmail} />
    </AuthCard>
  );
};

export default SignupPage;
