-- ================================================
-- MANUAL INVITE ACCEPTANCE SYSTEM
-- ================================================

-- 1. REMOVE THE AUTO-ACCEPT TRIGGER AND FUNCTION
-- ================================================

-- First drop the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_accept_invites ON auth.users;

-- Then drop the function
DROP FUNCTION IF EXISTS public.handle_new_user_invites();

-- 2. ADD RLS POLICY FOR USERS TO SEE THEIR OWN INVITES
-- ================================================

-- Allow users to SELECT invites addressed to their email
CREATE POLICY "Users can view their own invites"
ON public.workspace_invites
FOR SELECT
TO authenticated
USING (LOWER(email) = LOWER(auth.email()));

-- 3. CREATE accept_workspace_invite RPC FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION public.accept_workspace_invite(_invite_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite RECORD;
  v_user_email TEXT;
BEGIN
  -- Get current user's email
  SELECT auth.email() INTO v_user_email;
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch the invite and verify it belongs to this user
  SELECT * INTO v_invite
  FROM public.workspace_invites
  WHERE id = _invite_id
    AND LOWER(email) = LOWER(v_user_email);

  IF v_invite IS NULL THEN
    RAISE EXCEPTION 'Invite not found or not addressed to you';
  END IF;

  -- Add user to workspace (skip if already a member)
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_invite.workspace_id, auth.uid(), v_invite.role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Delete the invite
  DELETE FROM public.workspace_invites WHERE id = _invite_id;

  RETURN TRUE;
END;
$$;

-- 4. CREATE decline_workspace_invite RPC FUNCTION
-- ================================================

CREATE OR REPLACE FUNCTION public.decline_workspace_invite(_invite_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email TEXT;
  v_deleted INTEGER;
BEGIN
  -- Get current user's email
  SELECT auth.email() INTO v_user_email;
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the invite only if it belongs to this user
  DELETE FROM public.workspace_invites
  WHERE id = _invite_id
    AND LOWER(email) = LOWER(v_user_email);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  
  IF v_deleted = 0 THEN
    RAISE EXCEPTION 'Invite not found or not addressed to you';
  END IF;

  RETURN TRUE;
END;
$$;

-- 5. REMOVE LEGACY workspace_id IS NULL FALLBACK FROM FORMS RLS
-- ================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Workspace members can view forms" ON public.forms;
DROP POLICY IF EXISTS "Workspace members can create forms" ON public.forms;
DROP POLICY IF EXISTS "Workspace members can update forms" ON public.forms;
DROP POLICY IF EXISTS "Form creators and admins can delete forms" ON public.forms;

-- Recreate policies without the legacy fallback
CREATE POLICY "Workspace members can view forms"
ON public.forms
FOR SELECT
TO authenticated
USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can create forms"
ON public.forms
FOR INSERT
TO authenticated
WITH CHECK (
  workspace_id IS NOT NULL 
  AND is_workspace_member(workspace_id, auth.uid()) 
  AND created_by = auth.uid()
);

CREATE POLICY "Workspace members can update forms"
ON public.forms
FOR UPDATE
TO authenticated
USING (is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace members can delete forms"
ON public.forms
FOR DELETE
TO authenticated
USING (
  (created_by = auth.uid() AND is_workspace_member(workspace_id, auth.uid()))
  OR is_workspace_admin(workspace_id, auth.uid())
);

-- 6. ADD UNIQUE CONSTRAINT ON workspace_members IF NOT EXISTS
-- ================================================

-- This is needed for ON CONFLICT to work in accept_workspace_invite
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'workspace_members_workspace_id_user_id_key'
  ) THEN
    ALTER TABLE public.workspace_members 
    ADD CONSTRAINT workspace_members_workspace_id_user_id_key 
    UNIQUE (workspace_id, user_id);
  END IF;
END $$;