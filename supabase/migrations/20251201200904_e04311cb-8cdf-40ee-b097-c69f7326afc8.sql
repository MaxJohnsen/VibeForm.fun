-- Fix UPDATE RLS policy to include WITH CHECK clause for complete protection
DROP POLICY IF EXISTS "Users can update secrets for their integrations" ON public.integration_secrets;

CREATE POLICY "Users can update secrets for their integrations"
ON public.integration_secrets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM form_integrations fi
    JOIN forms f ON f.id = fi.form_id
    WHERE fi.id = integration_secrets.integration_id
    AND f.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM form_integrations fi
    JOIN forms f ON f.id = fi.form_id
    WHERE fi.id = integration_secrets.integration_id
    AND f.user_id = auth.uid()
  )
);