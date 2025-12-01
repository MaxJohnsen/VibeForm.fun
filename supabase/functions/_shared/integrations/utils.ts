import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function formatAnswerValue(value: any): string {
  if (value === null || value === undefined) return 'No answer';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

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
