-- Enable pgcrypto if not already enabled (for vault operations)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to save a secret to Supabase Vault
-- Returns the secret_id (UUID) for reference in config
CREATE OR REPLACE FUNCTION public.save_integration_secret(
  secret_value TEXT,
  secret_name TEXT,
  secret_description TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  secret_id UUID;
BEGIN
  -- Insert into vault.secrets table
  INSERT INTO vault.secrets (secret, name, description)
  VALUES (secret_value, secret_name, secret_description)
  RETURNING id INTO secret_id;
  
  RETURN secret_id;
END;
$$;

-- Function to get decrypted secret from Supabase Vault
-- Only callable by service_role via edge functions
CREATE OR REPLACE FUNCTION public.get_decrypted_secret(secret_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  decrypted_value TEXT;
BEGIN
  -- Retrieve decrypted value from vault
  SELECT decrypted_secret INTO decrypted_value
  FROM vault.decrypted_secrets
  WHERE id = secret_id;
  
  RETURN decrypted_value;
END;
$$;

-- Function to update an existing secret in Supabase Vault
CREATE OR REPLACE FUNCTION public.update_integration_secret(
  secret_id UUID,
  new_value TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
BEGIN
  -- Update the secret value in vault
  UPDATE vault.secrets
  SET secret = new_value, updated_at = now()
  WHERE id = secret_id;
  
  RETURN FOUND;
END;
$$;

-- Function to delete a secret from Supabase Vault
CREATE OR REPLACE FUNCTION public.delete_integration_secret(secret_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault
AS $$
BEGIN
  -- Delete the secret from vault
  DELETE FROM vault.secrets
  WHERE id = secret_id;
  
  RETURN FOUND;
END;
$$;

-- Revoke public access to these functions
REVOKE ALL ON FUNCTION public.save_integration_secret(TEXT, TEXT, TEXT) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.get_decrypted_secret(UUID) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_integration_secret(UUID, TEXT) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_integration_secret(UUID) FROM anon, authenticated;

-- Grant execute to service_role only (edge functions)
GRANT EXECUTE ON FUNCTION public.save_integration_secret(TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_decrypted_secret(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_integration_secret(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_integration_secret(UUID) TO service_role;