-- Drop the existing functions that don't work with vault permissions
DROP FUNCTION IF EXISTS public.save_integration_secret(text, text, text);
DROP FUNCTION IF EXISTS public.get_decrypted_secret(uuid);
DROP FUNCTION IF EXISTS public.update_integration_secret(uuid, text);
DROP FUNCTION IF EXISTS public.delete_integration_secret(uuid);

-- Create a simple function to verify integration ownership
-- This is all we need since edge functions will handle vault operations directly
CREATE OR REPLACE FUNCTION public.user_owns_integration(integration_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.form_integrations fi
    JOIN public.forms f ON f.id = fi.form_id
    WHERE fi.id = integration_id
      AND f.user_id = auth.uid()
  );
$$;