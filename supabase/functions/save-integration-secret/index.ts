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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { integrationId, keyType, value }: SaveSecretRequest = await req.json();

    if (!integrationId || !keyType || !value) {
      throw new Error('Missing required fields: integrationId, keyType, value');
    }

    console.log(`Saving secret for integration ${integrationId}, type: ${keyType}`);

    // Verify user owns this integration
    const { data: integration, error: integrationError } = await supabase
      .from('form_integrations')
      .select('form_id, forms!inner(user_id)')
      .eq('id', integrationId)
      .single();

    if (integrationError || !integration) {
      console.error('Integration lookup error:', integrationError);
      throw new Error('Integration not found');
    }

    // Check ownership
    const formUserId = (integration.forms as any).user_id;
    if (formUserId !== user.id) {
      throw new Error('Unauthorized: You do not own this integration');
    }

    // Encrypt the value
    console.log('Encrypting secret...');
    const encryptedValue = await encryptSecret(value);

    // Store in integration_secrets table
    // Use upsert to handle both insert and update cases
    const { error: saveError } = await supabase
      .from('integration_secrets')
      .upsert({
        integration_id: integrationId,
        key_type: keyType,
        encrypted_value: encryptedValue,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'integration_id,key_type',
      });

    if (saveError) {
      console.error('Save error:', saveError);
      throw new Error(`Failed to save secret: ${saveError.message}`);
    }

    console.log('Secret saved successfully');

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
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
