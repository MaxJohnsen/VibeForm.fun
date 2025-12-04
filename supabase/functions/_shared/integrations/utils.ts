import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Fetch and decrypt a secret from integration_secrets table
 */
export async function fetchAndDecryptSecret(
  supabase: SupabaseClient,
  integrationId: string,
  keyType: string
): Promise<string> {
  const { data, error } = await supabase
    .from('integration_secrets')
    .select('encrypted_value')
    .eq('integration_id', integrationId)
    .eq('key_type', keyType)
    .single();

  if (error || !data) {
    throw new Error(`${keyType} not found in secure storage`);
  }

  const { decryptSecret } = await import('../encryption.ts');
  return decryptSecret(data.encrypted_value);
}
