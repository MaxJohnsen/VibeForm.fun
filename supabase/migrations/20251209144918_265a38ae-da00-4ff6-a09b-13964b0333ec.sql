-- Phase 1: Workspace Architecture

-- 1. Create workspace_role enum
CREATE TYPE public.workspace_role AS ENUM ('admin', 'member');

-- 2. Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 3 AND char_length(name) <= 50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- 3. Create workspace_members table
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.workspace_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 4. Create workspace_invites table
CREATE TABLE public.workspace_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  role public.workspace_role NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, email)
);

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- 5. Modify forms table: add workspace_id (nullable for now), rename user_id to created_by
ALTER TABLE public.forms ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.forms RENAME COLUMN user_id TO created_by;

-- 6. Modify lottery_draws table: rename user_id to created_by
ALTER TABLE public.lottery_draws RENAME COLUMN user_id TO created_by;

-- 7. Create security definer functions

-- Check if user is a member of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _user_id
  )
$$;

-- Check if user is an admin of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_admin(_workspace_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Get user's role in workspace
CREATE OR REPLACE FUNCTION public.get_workspace_role(_workspace_id UUID, _user_id UUID)
RETURNS public.workspace_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.workspace_members
  WHERE workspace_id = _workspace_id
    AND user_id = _user_id
$$;

-- Count admins in workspace
CREATE OR REPLACE FUNCTION public.count_workspace_admins(_workspace_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.workspace_members
  WHERE workspace_id = _workspace_id
    AND role = 'admin'
$$;

-- 8. Create triggers

-- Auto-add workspace creator as admin
CREATE OR REPLACE FUNCTION public.handle_workspace_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_workspace_created();

-- Protect last admin from removal or demotion
CREATE OR REPLACE FUNCTION public.protect_last_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Only check if we're removing an admin or demoting them
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR 
     (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role = 'member') THEN
    SELECT public.count_workspace_admins(OLD.workspace_id) INTO admin_count;
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove or demote the last admin of a workspace';
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER protect_last_workspace_admin
  BEFORE UPDATE OR DELETE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_last_admin();

-- Auto-accept invites when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_invites()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add user to workspaces they were invited to
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  SELECT workspace_id, NEW.id, role
  FROM public.workspace_invites
  WHERE LOWER(email) = LOWER(NEW.email);
  
  -- Delete the processed invites
  DELETE FROM public.workspace_invites
  WHERE LOWER(email) = LOWER(NEW.email);
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_accept_invites
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_invites();

-- Update timestamp trigger for workspaces
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. RLS Policies for workspaces
CREATE POLICY "Members can view their workspaces"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(id, auth.uid()));

CREATE POLICY "Authenticated users can create workspaces"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update their workspaces"
  ON public.workspaces FOR UPDATE
  USING (public.is_workspace_admin(id, auth.uid()));

CREATE POLICY "Admins can delete their workspaces"
  ON public.workspaces FOR DELETE
  USING (public.is_workspace_admin(id, auth.uid()));

-- 10. RLS Policies for workspace_members
CREATE POLICY "Members can view workspace members"
  ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Admins can add workspace members"
  ON public.workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can update workspace members"
  ON public.workspace_members FOR UPDATE
  USING (public.is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can remove workspace members"
  ON public.workspace_members FOR DELETE
  USING (public.is_workspace_admin(workspace_id, auth.uid()));

-- Members can leave workspace themselves (but trigger protects last admin)
CREATE POLICY "Members can leave workspace"
  ON public.workspace_members FOR DELETE
  USING (user_id = auth.uid());

-- 11. RLS Policies for workspace_invites
CREATE POLICY "Admins can view workspace invites"
  ON public.workspace_invites FOR SELECT
  USING (public.is_workspace_admin(workspace_id, auth.uid()));

CREATE POLICY "Admins can create workspace invites"
  ON public.workspace_invites FOR INSERT
  TO authenticated
  WITH CHECK (public.is_workspace_admin(workspace_id, auth.uid()) AND invited_by = auth.uid());

CREATE POLICY "Admins can delete workspace invites"
  ON public.workspace_invites FOR DELETE
  USING (public.is_workspace_admin(workspace_id, auth.uid()));

-- 12. Update forms RLS policies
-- First drop existing policies
DROP POLICY IF EXISTS "Users can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can create their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can update their own forms" ON public.forms;
DROP POLICY IF EXISTS "Users can delete their own forms" ON public.forms;

-- Create new workspace-aware policies
-- View: all workspace members can view
CREATE POLICY "Workspace members can view forms"
  ON public.forms FOR SELECT
  USING (
    public.is_workspace_member(workspace_id, auth.uid())
    OR (workspace_id IS NULL AND created_by = auth.uid()) -- Legacy forms without workspace
  );

-- Create: workspace members can create
CREATE POLICY "Workspace members can create forms"
  ON public.forms FOR INSERT
  TO authenticated
  WITH CHECK (
    (workspace_id IS NOT NULL AND public.is_workspace_member(workspace_id, auth.uid()) AND created_by = auth.uid())
    OR (workspace_id IS NULL AND created_by = auth.uid()) -- Allow legacy creation during migration
  );

-- Update: workspace members can update
CREATE POLICY "Workspace members can update forms"
  ON public.forms FOR UPDATE
  USING (
    public.is_workspace_member(workspace_id, auth.uid())
    OR (workspace_id IS NULL AND created_by = auth.uid())
  );

-- Delete: creators can delete their own, admins can delete any
CREATE POLICY "Form creators and admins can delete forms"
  ON public.forms FOR DELETE
  USING (
    (created_by = auth.uid() AND public.is_workspace_member(workspace_id, auth.uid()))
    OR public.is_workspace_admin(workspace_id, auth.uid())
    OR (workspace_id IS NULL AND created_by = auth.uid())
  );

-- 13. Update lottery_draws RLS policies
DROP POLICY IF EXISTS "Users can create lottery draws for their forms" ON public.lottery_draws;
DROP POLICY IF EXISTS "Users can view their own lottery draws" ON public.lottery_draws;
DROP POLICY IF EXISTS "Users can delete their own lottery draws" ON public.lottery_draws;

CREATE POLICY "Workspace members can create lottery draws"
  ON public.lottery_draws FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = lottery_draws.form_id
        AND public.is_workspace_member(forms.workspace_id, auth.uid())
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Workspace members can view lottery draws"
  ON public.lottery_draws FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = lottery_draws.form_id
        AND public.is_workspace_member(forms.workspace_id, auth.uid())
    )
  );

CREATE POLICY "Workspace members can delete lottery draws"
  ON public.lottery_draws FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = lottery_draws.form_id
        AND (
          (created_by = auth.uid() AND public.is_workspace_member(forms.workspace_id, auth.uid()))
          OR public.is_workspace_admin(forms.workspace_id, auth.uid())
        )
    )
  );