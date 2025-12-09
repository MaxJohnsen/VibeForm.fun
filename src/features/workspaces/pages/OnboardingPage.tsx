import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/shared/ui';
import { CreateWorkspaceForm } from '../components/CreateWorkspaceForm';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { ROUTES } from '@/shared/constants/routes';
import { Sparkles } from 'lucide-react';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { createWorkspace, isCreating } = useWorkspaces();
  const { refetch } = useWorkspaceContext();

  const handleCreate = async (name: string) => {
    await createWorkspace({ name });
    await refetch();
    navigate(ROUTES.FORMS_HOME);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-[480px] w-full">
        <div className="flex flex-col items-center gap-8">
          {/* Brand Logo */}
          <div className="relative">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent animate-fade-in">
              Fairform
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 blur-xl -z-10 animate-pulse"></div>
          </div>

          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">Welcome!</span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              Create Your First Workspace
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Workspaces help you organize your forms and collaborate with your team. 
              You can create more workspaces later.
            </p>
          </div>

          {/* Form */}
          <div className="w-full">
            <CreateWorkspaceForm 
              onSubmit={handleCreate}
              isLoading={isCreating}
              submitLabel="Get Started"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
