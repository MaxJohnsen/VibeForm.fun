import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { GlassCard } from '@/shared/ui/GlassCard';
import { AppSidebar } from '@/shared/ui/AppSidebar';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { workspacesApi, WorkspaceMember, WorkspaceInvite } from '../api/workspacesApi';
import { InviteMemberForm } from '../components/InviteMemberForm';
import { MemberList } from '../components/MemberList';
import { PendingInvitesList } from '../components/PendingInvitesList';
import { ROUTES } from '@/shared/constants/routes';
import { useAuth } from '@/features/auth';

export const WorkspaceSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { activeWorkspace, userRole, refetch, workspaces, setActiveWorkspace } = useWorkspaceContext();
  
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);

  // Load workspace name
  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  // Load members and invites
  useEffect(() => {
    if (activeWorkspace) {
      loadMembersAndInvites();
    }
  }, [activeWorkspace?.id]);

  const loadMembersAndInvites = async () => {
    if (!activeWorkspace) return;
    
    setIsLoadingMembers(true);
    try {
      const [membersData, invitesData] = await Promise.all([
        workspacesApi.getWorkspaceMembers(activeWorkspace.id),
        workspacesApi.getWorkspaceInvites(activeWorkspace.id),
      ]);
      setMembers(membersData);
      setInvites(invitesData);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleSaveName = async () => {
    if (!activeWorkspace || !name.trim()) return;
    
    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      toast({
        title: 'Invalid name',
        description: 'Workspace name must be 3-50 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await workspacesApi.updateWorkspace(activeWorkspace.id, { name: trimmedName });
      await refetch();
      toast({
        title: 'Success',
        description: 'Workspace name updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update workspace',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendInvite = async (email: string, role: 'admin' | 'member') => {
    if (!activeWorkspace) return;

    setIsSendingInvite(true);
    try {
      await workspacesApi.sendInvite(activeWorkspace.id, email, role);
      await loadMembersAndInvites();
      toast({
        title: 'Invite sent',
        description: `Invitation sent to ${email}`,
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    setIsUpdatingMember(true);
    try {
      await workspacesApi.cancelInvite(inviteId);
      await loadMembersAndInvites();
      toast({
        title: 'Invite cancelled',
        description: 'The invitation has been cancelled',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel invite',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: 'admin' | 'member') => {
    setIsUpdatingMember(true);
    try {
      await workspacesApi.updateMemberRole(memberId, newRole);
      await loadMembersAndInvites();
      toast({
        title: 'Role updated',
        description: `Member role changed to ${newRole}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsUpdatingMember(true);
    try {
      await workspacesApi.removeMember(memberId);
      await loadMembersAndInvites();
      toast({
        title: 'Member removed',
        description: 'The member has been removed from the workspace',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;

    setIsDeleting(true);
    try {
      await workspacesApi.deleteWorkspace(activeWorkspace.id);
      await refetch();
      
      // Switch to another workspace or redirect to onboarding
      const remaining = workspaces.filter(w => w.id !== activeWorkspace.id);
      if (remaining.length > 0) {
        setActiveWorkspace(remaining[0]);
        navigate(ROUTES.FORMS_HOME);
      } else {
        navigate(ROUTES.ONBOARDING);
      }
      
      toast({
        title: 'Workspace deleted',
        description: 'The workspace and all its forms have been deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete workspace',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <AppSidebar />

      <div className="ml-0 md:ml-16 px-4 md:px-8 py-4 md:py-8 pb-24 md:pb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.FORMS_HOME)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Forms
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Workspace Settings</h1>
            <p className="text-muted-foreground">
              Manage your workspace settings and team members
            </p>
          </div>

          {/* Workspace Name */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Workspace Name</h2>
                <p className="text-sm text-muted-foreground">
                  The display name for your workspace
                </p>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex gap-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Workspace name"
                  className="flex-1 input-focus-glow"
                  disabled={isSaving}
                />
                <Button 
                  onClick={handleSaveName} 
                  disabled={isSaving || name.trim() === activeWorkspace.name}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            ) : (
              <p className="text-foreground font-medium">{activeWorkspace.name}</p>
            )}
          </GlassCard>

          {/* Team Members */}
          <GlassCard>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">Team Members</h2>
                <p className="text-sm text-muted-foreground">
                  {members.length} member{members.length !== 1 ? 's' : ''} in this workspace
                </p>
              </div>
            </div>

            {isLoadingMembers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <MemberList
                members={members}
                currentUserRole={userRole}
                onUpdateRole={handleUpdateRole}
                onRemoveMember={handleRemoveMember}
                isLoading={isUpdatingMember}
              />
            )}

            {isAdmin && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="font-medium">Invite New Members</h3>
                  <InviteMemberForm 
                    onSubmit={handleSendInvite}
                    isLoading={isSendingInvite}
                  />
                </div>

                {invites.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="font-medium">Pending Invites</h3>
                      <PendingInvitesList
                        invites={invites}
                        onCancelInvite={handleCancelInvite}
                        isLoading={isUpdatingMember}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </GlassCard>

          {/* Danger Zone */}
          {isAdmin && (
            <GlassCard className="border-destructive/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h2 className="font-semibold text-destructive">Danger Zone</h2>
                  <p className="text-sm text-muted-foreground">
                    Irreversible and destructive actions
                  </p>
                </div>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Workspace
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the workspace "{activeWorkspace.name}" and all its forms, responses, and data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteWorkspace}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Workspace
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
