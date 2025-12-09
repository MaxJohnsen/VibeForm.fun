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
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({ name: data.name })
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
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
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
};
