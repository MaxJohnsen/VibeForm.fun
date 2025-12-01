-- Drop RLS policies that allowed direct client access
DROP POLICY IF EXISTS "Users can update secrets for their integrations" ON public.integration_secrets;
DROP POLICY IF EXISTS "Users can delete secrets for their integrations" ON public.integration_secrets;

-- Create SECURITY DEFINER function to delete secrets (bypasses RLS in controlled context)
CREATE OR REPLACE FUNCTION public.delete_integration_secrets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete all secrets for this integration
  DELETE FROM public.integration_secrets
  WHERE integration_id = OLD.id;
  
  RETURN OLD;
END;
$$;

-- Create trigger that fires when an integration is deleted
CREATE TRIGGER on_integration_delete
  BEFORE DELETE ON public.form_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_integration_secrets();