import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SettingsCard } from '@/shared/ui/SettingsCard';
import { useWorkspaceContext } from '../../context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { workspacesApi, WorkspaceMember, WorkspaceInvite } from '../../api/workspacesApi';
import { InviteMemberForm } from '../InviteMemberForm';
import { MemberList } from '../MemberList';
import { PendingInvitesList } from '../PendingInvitesList';

export const MembersTab = () => {
  const { toast } = useToast();
  const { activeWorkspace, userRole } = useWorkspaceContext();
  
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);

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

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Team Members"
        description={`${members.length} member${members.length !== 1 ? 's' : ''} in this workspace`}
      >
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
      </SettingsCard>

      {isAdmin && (
        <SettingsCard
          title="Invite New Members"
          description="Send invitations to add people to this workspace"
        >
          <InviteMemberForm 
            onSubmit={handleSendInvite}
            isLoading={isSendingInvite}
          />
        </SettingsCard>
      )}

      {isAdmin && invites.length > 0 && (
        <SettingsCard
          title="Pending Invites"
          description="Invitations that haven't been accepted yet"
        >
          <PendingInvitesList
            invites={invites}
            onCancelInvite={handleCancelInvite}
            isLoading={isUpdatingMember}
          />
        </SettingsCard>
      )}
    </div>
  );
};
