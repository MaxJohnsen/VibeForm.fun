-- Fix protect_last_admin to allow cascade deletes when workspace is deleted
CREATE OR REPLACE FUNCTION public.protect_last_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_count INTEGER;
  workspace_exists BOOLEAN;
BEGIN
  -- Only check if we're removing an admin or demoting them
  IF (TG_OP = 'DELETE' AND OLD.role = 'admin') OR 
     (TG_OP = 'UPDATE' AND OLD.role = 'admin' AND NEW.role = 'member') THEN
    
    -- Check if the workspace still exists (it won't during cascade delete)
    SELECT EXISTS (
      SELECT 1 FROM public.workspaces WHERE id = OLD.workspace_id
    ) INTO workspace_exists;
    
    -- If workspace is being deleted, allow the member deletion
    IF NOT workspace_exists THEN
      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
    END IF;
    
    -- Otherwise, check admin count
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
$function$;