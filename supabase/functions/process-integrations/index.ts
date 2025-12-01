import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getHandler, hasHandler } from '../_shared/integrations/registry.ts';
import type { Integration, HandlerContext } from '../_shared/integrations/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formId, responseId } = await req.json();
    console.log('Processing integrations for form:', formId, 'response:', responseId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch enabled integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('form_integrations')
      .select('*')
      .eq('form_id', formId)
      .eq('enabled', true)
      .eq('trigger', 'form_completed');

    if (integrationsError) throw integrationsError;
    if (!integrations || integrations.length === 0) {
      console.log('No enabled integrations found');
      return new Response(JSON.stringify({ success: true, processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch complete response data with answers
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select('*, answers(*), forms(title, slug)')
      .eq('id', responseId)
      .single();

    if (responseError) throw responseError;

    // Fetch all questions for the form
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('position');

    if (questionsError) throw questionsError;

    // Process each integration
    const results = await Promise.allSettled(
      integrations.map((integration: Integration) =>
        executeIntegration({ integration, response, questions, supabase })
      )
    );

    console.log(`Processed ${results.length} integrations`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results: results.map((r) => (r.status === 'fulfilled' ? 'success' : 'error')),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in process-integrations:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function executeIntegration(ctx: HandlerContext) {
  const { integration, response, supabase } = ctx;
  const startTime = Date.now();
  let status: 'success' | 'error' = 'success';
  let errorMessage: string | undefined;
  let responseData: any = null;

  try {
    console.log(`Processing ${integration.type} integration: ${integration.name}`);

    if (!hasHandler(integration.type)) {
      throw new Error(`Unknown integration type: ${integration.type}`);
    }

    const handler = getHandler(integration.type);
    const result = await handler(ctx);

    if (!result.success) {
      throw new Error(result.error || 'Unknown handler error');
    }
    responseData = result.data;
  } catch (error: any) {
    status = 'error';
    errorMessage = error.message;
    console.error(`Error processing ${integration.type}:`, error);
  }

  // Log the integration execution
  await supabase.from('integration_logs').insert({
    integration_id: integration.id,
    response_id: response.id,
    status,
    payload: { response, questions: ctx.questions },
    response_data: responseData,
    error_message: errorMessage,
  });

  console.log(`Integration ${integration.name} completed in ${Date.now() - startTime}ms`);
}
