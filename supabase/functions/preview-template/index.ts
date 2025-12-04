import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildTemplateContext, processTemplate } from '../_shared/templateEngine.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formId, templates } = await req.json();

    if (!formId) {
      return new Response(
        JSON.stringify({ error: 'formId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Fetch form (RLS will ensure user owns it)
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (formError) {
      console.error('Error fetching form:', formError);
      return new Response(
        JSON.stringify({ error: 'Form not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('position');

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch questions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const safeQuestions = questions || [];

    // Generate sample answers
    const sampleAnswers = safeQuestions.map((q) => ({
      id: `sample-${q.id}`,
      question_id: q.id,
      response_id: 'sample-response',
      answer_value: generateSampleAnswer(q.type, q.settings),
      answered_at: new Date().toISOString(),
    }));

    const sampleResponse = {
      id: 'sample-response-id',
      form_id: formId,
      completed_at: new Date().toISOString(),
      status: 'completed',
    };

    // Build template context using the single source of truth
    const context = buildTemplateContext(form, sampleResponse, safeQuestions, sampleAnswers);

    // Process any provided templates
    const processed: Record<string, string> = {};
    if (templates && typeof templates === 'object') {
      for (const [key, template] of Object.entries(templates)) {
        if (typeof template === 'string') {
          processed[key] = processTemplate(template, context);
        }
      }
    }

    console.log(`Preview template generated for form ${formId} with ${safeQuestions.length} questions`);

    return new Response(
      JSON.stringify({
        form,
        questions: safeQuestions,
        sampleAnswers,
        sampleResponse,
        context,
        processed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Preview template error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Generate sample answer based on question type
 */
function generateSampleAnswer(type: string, settings?: any): any {
  switch (type) {
    case 'short_text':
      return 'John Doe';
    case 'long_text':
      return 'This is a sample longer text response that the user might provide.';
    case 'email':
      return 'user@example.com';
    case 'phone':
      return '+1 (555) 123-4567';
    case 'respondent_name':
      return 'Jane Smith';
    case 'yes_no':
      return true;
    case 'rating':
      return settings?.max ? Math.floor(settings.max * 0.8) : 4;
    case 'multiple_choice':
      return settings?.choices?.[0] || 'Option A';
    case 'date':
      return new Date().toISOString().split('T')[0];
    default:
      return 'Sample answer';
  }
}
