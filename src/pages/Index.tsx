import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { ROUTES } from '@/shared/constants/routes';
import { Button } from '@/components/ui/button';
import { PageLoader, GlassCard } from '@/shared/ui';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate(ROUTES.LOGIN);
      } else {
        navigate(ROUTES.FORMS_HOME);
      }
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.LOGIN);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <GlassCard className="p-8 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-sm mx-auto">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
          >
            <path
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2 font-heading">
            Welcome to Fairform
          </h1>
          <p className="text-muted-foreground">
            You're successfully authenticated!
          </p>
        </div>

        <div className="bg-secondary rounded-xl p-4 text-left">
          <p className="text-sm text-muted-foreground mb-1">Signed in as:</p>
          <p className="text-foreground font-medium">{user.email}</p>
        </div>

        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full"
        >
          Sign out
        </Button>
      </GlassCard>
    </div>
  );
};

export default Index;