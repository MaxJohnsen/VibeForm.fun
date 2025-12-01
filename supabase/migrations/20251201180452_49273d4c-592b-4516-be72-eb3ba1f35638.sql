-- Create integration_secrets table for secure storage of API keys
CREATE TABLE public.integration_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES public.form_integrations(id) ON DELETE CASCADE,
  key_type TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(integration_id, key_type)
);

-- Enable RLS
ALTER TABLE public.integration_secrets ENABLE ROW LEVEL SECURITY;

-- Write-only policies: Users can INSERT/UPDATE/DELETE but NEVER SELECT
-- This ensures keys can be set but never read by the client

-- Allow users to insert secrets for integrations they own
CREATE POLICY "Users can insert secrets for their integrations"
ON public.integration_secrets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.form_integrations fi
    JOIN public.forms f ON f.id = fi.form_id
    WHERE fi.id = integration_secrets.integration_id
    AND f.user_id = auth.uid()
  )
);

-- Allow users to update secrets for integrations they own
CREATE POLICY "Users can update secrets for their integrations"
ON public.integration_secrets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.form_integrations fi
    JOIN public.forms f ON f.id = fi.form_id
    WHERE fi.id = integration_secrets.integration_id
    AND f.user_id = auth.uid()
  )
);

-- Allow users to delete secrets for integrations they own
CREATE POLICY "Users can delete secrets for their integrations"
ON public.integration_secrets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.form_integrations fi
    JOIN public.forms f ON f.id = fi.form_id
    WHERE fi.id = integration_secrets.integration_id
    AND f.user_id = auth.uid()
  )
);

-- NO SELECT POLICY - This is critical for security
-- Only service role (edge functions) can read encrypted values

-- Add trigger for updated_at
CREATE TRIGGER update_integration_secrets_updated_at
BEFORE UPDATE ON public.integration_secrets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster lookups by service role
CREATE INDEX idx_integration_secrets_integration_id 
ON public.integration_secrets(integration_id);