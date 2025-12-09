-- Allow invited users to see workspace names
-- This adds a policy so users can view workspaces they've been invited to

CREATE POLICY "Invited users can view workspace name"
ON public.workspaces
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_invites
    WHERE workspace_invites.workspace_id = workspaces.id
      AND LOWER(workspace_invites.email) = LOWER(auth.email())
  )
);