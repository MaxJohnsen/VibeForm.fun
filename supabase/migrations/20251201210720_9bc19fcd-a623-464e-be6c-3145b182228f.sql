-- Remove the INSERT RLS policy (not used - edge function uses service role)
DROP POLICY IF EXISTS "Users can insert secrets for their integrations" ON public.integration_secrets;