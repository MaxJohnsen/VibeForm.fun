import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { encryptSecret } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SaveSecretRequest {
  integrationId: string;
  keyType: string;
  value: string;
  mode: 'insert' | 'update';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === AUTHENTICATION ===
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with user's JWT (RLS will be enforced)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized: Invalid or expired token');
    }

    // === INPUT VALIDATION ===
    const body = await req.json();
    const { integrationId, keyType, value, mode } = body as SaveSecretRequest;

    if (!integrationId || typeof integrationId !== 'string') {
      throw new Error('Invalid integrationId');
    }
    if (!keyType || typeof keyType !== 'string') {
      throw new Error('Invalid keyType');
    }
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid value');
    }
    if (!mode || !['insert', 'update'].includes(mode)) {
      throw new Error('Invalid mode: must be "insert" or "update"');
    }

    // Validate keyType is in allowed list
    const allowedKeyTypes = ['resend_api_key', 'slack_webhook', 'webhook_secret'];
    if (!allowedKeyTypes.includes(keyType)) {
      throw new Error(`Invalid keyType. Allowed: ${allowedKeyTypes.join(', ')}`);
    }

    console.log(`[${user.id}] ${mode.toUpperCase()} secret for integration ${integrationId}, type: ${keyType}`);

    // === DEFENSE LAYER 1: MANUAL OWNERSHIP CHECK ===
    // This check uses the user's JWT, so RLS on form_integrations also applies
    const { data: integration, error: integrationError } = await supabase
      .from('form_integrations')
      .select('id, form_id, forms!inner(user_id)')
      .eq('id', integrationId)
      .single();

    if (integrationError) {
      console.error('Integration lookup error:', integrationError);
      throw new Error('Integration not found or access denied');
    }

    // Explicit ownership check (belt AND suspenders)
    const formUserId = (integration.forms as any).user_id;
    if (formUserId !== user.id) {
      console.error(`Ownership mismatch: form owner ${formUserId} !== user ${user.id}`);
      throw new Error('Unauthorized: You do not own this integration');
    }

    // === ENCRYPT THE SECRET ===
    console.log('Encrypting secret...');
    const encryptedValue = await encryptSecret(value);

    // === DEFENSE LAYER 2: DATABASE WRITE WITH RLS ===
    // Using user's JWT context - RLS policies will enforce authorization
    
    if (mode === 'insert') {
      console.log('Inserting new secret...');
      const { error: insertError } = await supabase
        .from('integration_secrets')
        .insert({
          integration_id: integrationId,
          key_type: keyType,
          encrypted_value: encryptedValue,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error('Failed to save secret');
      }
    } else {
      console.log('Updating existing secret...');
      const { error: updateError } = await supabase
        .from('integration_secrets')
        .update({ 
          encrypted_value: encryptedValue, 
          updated_at: new Date().toISOString() 
        })
        .eq('integration_id', integrationId)
        .eq('key_type', keyType);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update secret');
      }
    }

    console.log(`[${user.id}] Secret ${mode}ed successfully for integration ${integrationId}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in save-integration-secret:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const safeMessage = errorMessage.includes('Unauthorized') || errorMessage.includes('Invalid')
      ? errorMessage
      : 'Failed to save secret';
    
    return new Response(
      JSON.stringify({ error: safeMessage }),
      {
        status: errorMessage.includes('Unauthorized') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
