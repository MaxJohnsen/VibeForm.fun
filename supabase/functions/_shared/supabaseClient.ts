import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

/**
 * Create a Supabase client with service role credentials
 * Used for edge functions that need full database access
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}
