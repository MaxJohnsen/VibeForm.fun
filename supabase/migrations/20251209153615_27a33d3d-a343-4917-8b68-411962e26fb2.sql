-- Add created_by column to workspaces
ALTER TABLE public.workspaces
ADD COLUMN created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Backfill existing workspaces with their first admin member
UPDATE public.workspaces w
SET created_by = (
  SELECT user_id
  FROM public.workspace_members wm
  WHERE wm.workspace_id = w.id
    AND wm.role = 'admin'
  ORDER BY wm.created_at ASC
  LIMIT 1
)
WHERE w.created_by IS NULL;

-- Drop the old INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create workspaces" ON public.workspaces;

-- Create new INSERT policy requiring created_by = auth.uid()
CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Drop the old SELECT policy
DROP POLICY IF EXISTS "Members can view their workspaces" ON public.workspaces;

-- Create new SELECT policy allowing creator OR members
CREATE POLICY "Members can view their workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (is_workspace_member(id, auth.uid()) OR created_by = auth.uid());