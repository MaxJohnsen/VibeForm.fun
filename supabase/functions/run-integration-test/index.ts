import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getHandler, hasHandler } from '../_shared/integrations/registry.ts';
import { buildTemplateContext } from '../_shared/templateEngine.ts';
import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { jsonResponse, jsonError } from '../_shared/responses.ts';
import type { HandlerContext, ResponseWithForm, Form, Question, Answer } from '../_shared/integrations/types.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    // 1. Extract user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonError('Missing authorization header', 401);
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
      return jsonError('Unauthorized', 401);
    }

    console.log('User authenticated:', user.id);

    // 2. Parse request
    const { integrationId } = await req.json();
    if (!integrationId) {
      return jsonError('Missing integrationId', 400);
    }

    console.log('Testing integration:', integrationId);

    // 3. Create service client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Fetch integration WITH form and workspace info
    const { data: integrationData, error: integrationError } = await supabase
      .from('form_integrations')
      .select(`
        *,
        forms!inner(id, title, slug, created_by, workspace_id)
      `)
      .eq('id', integrationId)
      .single();

    if (integrationError) {
      console.error('Integration fetch error:', integrationError);
      return jsonError('Integration not found', 404);
    }

    // CRITICAL: Verify workspace membership or ownership
    const formData = integrationData.forms as { 
      id: string; 
      title: string; 
      slug: string | null; 
      created_by: string;
      workspace_id: string | null;
    };

    if (formData.workspace_id) {
      // Check workspace membership
      const { data: isMember, error: memberError } = await supabase.rpc(
        'is_workspace_member',
        { _workspace_id: formData.workspace_id, _user_id: user.id }
      );

      if (memberError || !isMember) {
        console.error('Workspace membership check failed:', { 
          workspaceId: formData.workspace_id, 
          userId: user.id,
          error: memberError 
        });
        return jsonError('Access denied', 403);
      }
    } else if (formData.created_by !== user.id) {
      // Legacy form without workspace - check direct ownership
      console.error('Ownership check failed:', { formCreatedBy: formData.created_by, userId: user.id });
      return jsonError('Access denied', 403);
    }

    console.log('Access verified for form:', formData.title);

    // 5. Validate handler exists
    if (!hasHandler(integrationData.type)) {
      return jsonError(`Unknown integration type: ${integrationData.type}`, 400);
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
    return jsonResponse({
      success: result.success,
      message: result.success ? 'Test successful! Your integration is working.' : (result.error || 'Test failed'),
      integration: {
        type: integrationData.type,
        name: integrationData.name,
      },
    });
  } catch (error: any) {
    console.error('Error in run-integration-test:', error);
    return jsonResponse(
      { 
        success: false,
        error: error.message || 'An unexpected error occurred'
      },
      500
    );
  }
});
