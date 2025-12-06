import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getHandler, hasHandler } from '../_shared/integrations/registry.ts';
import { buildTemplateContext } from '../_shared/templateEngine.ts';
import type { HandlerContext, ResponseWithForm, Form, Question, Answer } from '../_shared/integrations/types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Extract user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's token to verify auth
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.id);

    // 2. Parse request
    const { integrationId } = await req.json();
    if (!integrationId) {
      return new Response(
        JSON.stringify({ error: 'Missing integrationId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Testing integration:', integrationId);

    // 3. Create service client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Fetch integration WITH ownership verification via join
    const { data: integrationData, error: integrationError } = await supabase
      .from('form_integrations')
      .select(`
        *,
        forms!inner(id, title, slug, user_id)
      `)
      .eq('id', integrationId)
      .single();

    if (integrationError) {
      console.error('Integration fetch error:', integrationError);
      return new Response(
        JSON.stringify({ error: 'Integration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Verify ownership - the user must own the form
    const formData = integrationData.forms as { id: string; title: string; slug: string | null; user_id: string };
    if (formData.user_id !== user.id) {
      console.error('Ownership check failed:', { formUserId: formData.user_id, userId: user.id });
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Ownership verified for form:', formData.title);

    // 5. Validate handler exists
    if (!hasHandler(integrationData.type)) {
      return new Response(
        JSON.stringify({ error: `Unknown integration type: ${integrationData.type}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Build minimal test context
    const testForm: Form = {
      id: formData.id,
      title: formData.title,
      slug: formData.slug,
    };

    const testQuestions: Question[] = [
      { id: 'test-q1', label: 'Your Name', type: 'short_text', position: 1 },
      { id: 'test-q2', label: 'Feedback', type: 'long_text', position: 2 },
    ];

    const testAnswers: Answer[] = [
      { id: 'test-a1', question_id: 'test-q1', answer_value: 'Test User', answered_at: new Date().toISOString() },
      { id: 'test-a2', question_id: 'test-q2', answer_value: 'This is a test message to verify your integration is working correctly.', answered_at: new Date().toISOString() },
    ];

    const testResponse: ResponseWithForm = {
      id: 'test-response-id',
      form_id: formData.id,
      status: 'completed',
      completed_at: new Date().toISOString(),
      forms: testForm,
      answers: testAnswers,
    };

    // Build template context
    const templateContext = buildTemplateContext(
      testForm,
      testResponse,
      testQuestions,
      testAnswers
    );

    // 7. Build handler context with isTest flag
    const handlerContext: HandlerContext = {
      integration: {
        id: integrationData.id,
        type: integrationData.type,
        name: integrationData.name,
        config: integrationData.config,
      },
      response: testResponse,
      form: testForm,
      questions: testQuestions,
      answers: testAnswers,
      templateContext,
      supabase,
      isTest: true, // IMPORTANT: Mark as test execution
    };

    // 8. Get handler from registry and execute
    const handler = getHandler(integrationData.type);
    console.log('Executing handler for type:', integrationData.type);
    
    const result = await handler(handlerContext);

    console.log('Handler result:', result.success ? 'success' : 'failed', result.error || '');

    // 9. Return result (no logging to avoid FK constraint violations)
    return new Response(
      JSON.stringify({
        success: result.success,
        message: result.success ? 'Test successful! Your integration is working.' : (result.error || 'Test failed'),
        integration: {
          type: integrationData.type,
          name: integrationData.name,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in run-integration-test:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
