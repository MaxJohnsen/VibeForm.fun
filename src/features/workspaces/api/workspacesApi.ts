import { supabase } from '@/integrations/supabase/client';

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'admin' | 'member';
  created_at: string;
  email?: string;
}

export interface WorkspaceInvite {
  id: string;
  workspace_id: string;
  email: string;
  role: 'admin' | 'member';
  invited_by: string;
  created_at: string;
}

export interface PendingInvite {
  id: string;
  workspace_id: string;
  workspace_name: string;
  role: 'admin' | 'member';
  created_at: string;
  invited_by_email?: string;
}

export interface WorkspaceWithRole extends Workspace {
  role: 'admin' | 'member';
}

export interface CreateWorkspaceData {
  name: string;
}

export const workspacesApi = {
  async fetchWorkspaces(): Promise<WorkspaceWithRole[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get all workspaces the user is a member of
    const { data: memberships, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id);

    if (memberError) throw memberError;
    if (!memberships || memberships.length === 0) return [];

    const workspaceIds = memberships.map(m => m.workspace_id);
    
    const { data: workspaces, error } = await supabase
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Merge workspace data with role
    return (workspaces || []).map(workspace => {
      const membership = memberships.find(m => m.workspace_id === workspace.id);
      return {
        ...workspace,
        role: membership?.role as 'admin' | 'member',
      };
    });
  },

  async createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({ name: data.name, created_by: user.id })
      .select()
      .single();

    if (error) throw error;
    return workspace;
  },

  async updateWorkspace(id: string, data: Partial<CreateWorkspaceData>): Promise<Workspace> {
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return workspace;
  },

  async deleteWorkspace(id: string): Promise<void> {
    const { error } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    // Use edge function to get members with emails
    const { data, error } = await supabase.functions.invoke('get-workspace-members', {
      body: { workspaceId },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data?.members || [];
  },

  async getWorkspaceInvites(workspaceId: string): Promise<WorkspaceInvite[]> {
    const { data, error } = await supabase
      .from('workspace_invites')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async sendInvite(workspaceId: string, email: string, role: 'admin' | 'member'): Promise<void> {
    const { data, error } = await supabase.functions.invoke('send-workspace-invite', {
      body: { workspaceId, email, role, appUrl: window.location.origin },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
  },

  async cancelInvite(inviteId: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_invites')
      .delete()
      .eq('id', inviteId);

    if (error) throw error;
  },

  async updateMemberRole(memberId: string, role: 'admin' | 'member'): Promise<void> {
    const { error } = await supabase
      .from('workspace_members')
      .update({ role })
      .eq('id', memberId);

    if (error) throw error;
  },

  async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('id', memberId);

    if (error) throw error;
  },

  async leaveWorkspace(workspaceId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  async getUserRole(workspaceId: string): Promise<'admin' | 'member' | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (error) return null;
    return data?.role as 'admin' | 'member';
  },

  // Get pending invites for the current user
  async getMyPendingInvites(): Promise<PendingInvite[]> {
    // Fetch invites with workspace name using join
    // RLS policy filters to only show invites addressed to current user's email
    const { data: invites, error } = await supabase
      .from('workspace_invites')
      .select(`
        id, 
        workspace_id, 
        role, 
        created_at,
        invited_by,
        workspaces (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!invites || invites.length === 0) return [];

    // Get inviter emails via edge function (since we can't access auth.users directly)
    // For now, we'll skip this as it would require an additional edge function
    // The invite will show without the inviter email

    return invites.map(invite => ({
      id: invite.id,
      workspace_id: invite.workspace_id,
      workspace_name: (invite.workspaces as any)?.name || 'Unknown Workspace',
      role: invite.role,
      created_at: invite.created_at,
      // invited_by_email would require an additional query to auth.users
    }));
  },

  // Accept a workspace invite
  async acceptInvite(inviteId: string): Promise<void> {
    const { error } = await supabase.rpc('accept_workspace_invite', {
      _invite_id: inviteId,
    });

    if (error) throw error;
  },

  // Decline a workspace invite
  async declineInvite(inviteId: string): Promise<void> {
    const { error } = await supabase.rpc('decline_workspace_invite', {
      _invite_id: inviteId,
    });

    if (error) throw error;
  },
};
