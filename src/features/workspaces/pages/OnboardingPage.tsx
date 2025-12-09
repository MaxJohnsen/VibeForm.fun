import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Loader2, Plus } from 'lucide-react';
import { OnboardingCard } from '@/shared/ui';
import { CreateWorkspaceForm } from '../components/CreateWorkspaceForm';
import { InviteCard } from '../components/InviteCard';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { workspacesApi, PendingInvite } from '../api/workspacesApi';
import { ROUTES } from '@/shared/constants/routes';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createWorkspace, isCreating } = useWorkspaces();
  const { refetch } = useWorkspaceContext();
  
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoadingInvites, setIsLoadingInvites] = useState(true);
  const [processingInviteId, setProcessingInviteId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load pending invites on mount
  useEffect(() => {
    const loadInvites = async () => {
      try {
        const data = await workspacesApi.getMyPendingInvites();
        setInvites(data);
      } catch (error) {
        console.error('Failed to load pending invites:', error);
      } finally {
        setIsLoadingInvites(false);
      }
    };
    loadInvites();
  }, []);

  const handleAcceptInvite = async (inviteId: string) => {
    setProcessingInviteId(inviteId);
    try {
      await workspacesApi.acceptInvite(inviteId);
      await refetch();
      toast({
        title: 'Welcome!',
        description: 'You have joined the workspace',
      });
      navigate(ROUTES.FORMS_HOME);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invite',
        variant: 'destructive',
      });
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    setProcessingInviteId(inviteId);
    try {
      await workspacesApi.declineInvite(inviteId);
      setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
      toast({
        title: 'Invite declined',
        description: 'The invitation has been declined',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to decline invite',
        variant: 'destructive',
      });
    } finally {
      setProcessingInviteId(null);
    }
  };

  const handleCreateWorkspace = async (name: string) => {
    await createWorkspace({ name });
    await refetch();
    navigate(ROUTES.FORMS_HOME);
  };

  // Loading state
  if (isLoadingInvites) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasInvites = invites.length > 0;

  // If user has invites, show them prominently
  if (hasInvites && !showCreateForm) {
    return (
      <OnboardingCard
        icon={Mail}
        title="You've Been Invited!"
        subtitle="Accept an invitation to join a workspace, or create your own to get started."
      >
        {/* Invites List */}
        <div className="space-y-3">
          {invites.map((invite) => (
            <InviteCard
              key={invite.id}
              invite={invite}
              onAccept={handleAcceptInvite}
              onDecline={handleDeclineInvite}
              isProcessing={processingInviteId === invite.id}
            />
          ))}
        </div>

        {/* Separator */}
        <div className="relative py-2">
          <Separator className="bg-border/50" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            or
          </span>
        </div>

        {/* Create New Option */}
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create a new workspace instead
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You can always create more workspaces later
        </p>
      </OnboardingCard>
    );
  }

  // Show create workspace form (either no invites or user chose to create)
  return (
    <OnboardingCard
      icon={Sparkles}
      title={hasInvites ? 'Create New Workspace' : 'Create Your First Workspace'}
      subtitle="Workspaces help you organize your forms and collaborate with your team."
      footer={
        hasInvites ? (
          <Button
            variant="ghost"
            className="w-full text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setShowCreateForm(false)}
          >
            ← Back to invitations
          </Button>
        ) : undefined
      }
    >
      <CreateWorkspaceForm
        onSubmit={handleCreateWorkspace}
        isLoading={isCreating}
        submitLabel="Get Started"
      />

      {!hasInvites && (
        <p className="text-xs text-muted-foreground text-center">
          You can create more workspaces or invite team members later
        </p>
      )}
    </OnboardingCard>
  );
};
