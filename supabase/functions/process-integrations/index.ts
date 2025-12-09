import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getHandler, hasHandler } from '../_shared/integrations/registry.ts';
import { buildTemplateContext } from '../_shared/templateEngine.ts';
import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { jsonResponse, jsonError } from '../_shared/responses.ts';
import type { Integration, HandlerContext, ResponseWithForm, Form, Question, Answer } from '../_shared/integrations/types.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    // Validate internal token for security
    const internalToken = req.headers.get('x-internal-token');
    const expectedToken = Deno.env.get('INTERNAL_FUNCTIONS_SECRET');
    
    if (!internalToken || internalToken !== expectedToken) {
      console.error('Unauthorized: Invalid or missing internal token');
      return jsonError('Unauthorized', 401);
    }

    const { formId, responseId } = await req.json();
    console.log('Processing integrations for form:', formId, 'response:', responseId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify response exists and is completed
    const { data: responseCheck, error: responseCheckError } = await supabase
      .from('responses')
      .select('status, integrations_processed_at')
      .eq('id', responseId)
      .single();

    if (responseCheckError || !responseCheck) {
      console.error('Response not found:', responseCheckError);
      return jsonError('Response not found', 400);
    }

    if (responseCheck.status !== 'completed') {
      console.error('Response not completed:', responseCheck.status);
      return jsonError('Response not completed', 400);
    }

    // Idempotency check - if already processed, return early
    if (responseCheck.integrations_processed_at) {
      console.log('Integrations already processed at:', responseCheck.integrations_processed_at);
      return jsonResponse({ 
        success: true, 
        processed: 0,
        message: 'Already processed'
      });
    }

    // Mark as processed immediately (optimistic lock)
    const { error: updateError } = await supabase
      .from('responses')
      .update({ integrations_processed_at: new Date().toISOString() })
      .eq('id', responseId)
      .is('integrations_processed_at', null);

    if (updateError) {
      console.error('Failed to mark as processed (might be race condition):', updateError);
      // Another process might have started processing - return early
      return jsonResponse({ 
        success: true, 
        processed: 0,
        message: 'Processing started by another request'
      });
    }

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
      return jsonResponse({ success: true, processed: 0 });
    }

    // Fetch complete response data with answers
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select('*, answers(*), forms(id, title, slug)')
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

    // Extract typed data
    const form: Form = response.forms as Form;
    const answers: Answer[] = (response.answers || []) as Answer[];
    const typedQuestions: Question[] = (questions || []) as Question[];
    const typedResponse: ResponseWithForm = response as ResponseWithForm;

    // PRE-BUILD template context ONCE for all handlers
    const templateContext = buildTemplateContext(form, response, typedQuestions, answers);
    console.log('Template context built with variables:', Object.keys(templateContext).length);

    // Process each integration with pre-built context
    const results = await Promise.allSettled(
      integrations.map((integration: Integration) =>
        executeIntegration({
          integration,
          response: typedResponse,
          form,
          questions: typedQuestions,
          answers,
          templateContext,
          supabase,
        })
      )
    );

    console.log(`Processed ${results.length} integrations`);

    return jsonResponse({
      success: true,
      processed: results.length,
      results: results.map((r) => (r.status === 'fulfilled' ? 'success' : 'error')),
    });
  } catch (error: any) {
    console.error('Error in process-integrations:', error);
    return jsonError(error.message, 500);
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
    payload: { templateContext: ctx.templateContext },
    response_data: responseData,
    error_message: errorMessage,
  });

  console.log(`Integration ${integration.name} completed in ${Date.now() - startTime}ms`);
}
