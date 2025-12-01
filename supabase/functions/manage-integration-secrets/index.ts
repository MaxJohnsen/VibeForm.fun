import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecretRequest {
  operation: 'create' | 'update' | 'delete';
  integrationId: string;
  secretValue?: string;
  secretName?: string;
  secretId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Create service role client for vault operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { operation, integrationId, secretValue, secretName, secretId }: SecretRequest = await req.json();

    // Verify user owns the integration
    const { data: integration, error: integrationError } = await supabase
      .from('form_integrations')
      .select('id, form_id, forms!inner(user_id)')
      .eq('id', integrationId)
      .single();

    if (integrationError || !integration) {
      throw new Error('Integration not found');
    }

    // @ts-ignore - forms relation exists
    if (integration.forms.user_id !== user.id) {
      throw new Error('Unauthorized - not the owner');
    }

    let result;

    switch (operation) {
      case 'create': {
        if (!secretValue || !secretName) {
          throw new Error('Missing secretValue or secretName for create operation');
        }

        console.log('Creating secret:', secretName);
        
        // Insert directly into vault.secrets using service role
        const { data, error } = await supabaseAdmin
          .from('vault.secrets')
          .insert({
            secret: secretValue,
            name: secretName,
            description: `Integration secret for ${integrationId}`
          })
          .select('id')
          .single();

        if (error) {
          console.error('Error saving secret:', error);
          throw new Error(`Failed to save secret: ${error.message}`);
        }

        result = { secretId: data.id };
        console.log('Secret created with ID:', data.id);
        break;
      }

      case 'update': {
        if (!secretId || !secretValue) {
          throw new Error('Missing secretId or secretValue for update operation');
        }

        console.log('Updating secret:', secretId);

        // Update directly in vault.secrets using service role
        const { error } = await supabaseAdmin
          .from('vault.secrets')
          .update({
            secret: secretValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', secretId);

        if (error) {
          console.error('Error updating secret:', error);
          throw new Error(`Failed to update secret: ${error.message}`);
        }

        result = { success: true };
        console.log('Secret updated successfully');
        break;
      }

      case 'delete': {
        if (!secretId) {
          throw new Error('Missing secretId for delete operation');
        }

        console.log('Deleting secret:', secretId);

        // Delete directly from vault.secrets using service role
        const { error } = await supabaseAdmin
          .from('vault.secrets')
          .delete()
          .eq('id', secretId);

        if (error) {
          console.error('Error deleting secret:', error);
          throw new Error(`Failed to delete secret: ${error.message}`);
        }

        result = { success: true };
        console.log('Secret deleted successfully');
        break;
      }

      default:
        throw new Error('Invalid operation');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in manage-integration-secrets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
