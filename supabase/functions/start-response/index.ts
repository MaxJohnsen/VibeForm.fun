import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formId } = await req.json();

    if (!formId) {
      return new Response(
        JSON.stringify({ error: 'formId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify form exists and is active
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, description, status')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      console.error('Form not found:', formError);
      return new Response(
        JSON.stringify({ error: 'Form not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (form.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Form is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get first question
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('position', { ascending: true });

    if (questionsError || !questions || questions.length === 0) {
      console.error('No questions found:', questionsError);
      return new Response(
        JSON.stringify({ error: 'No questions found for this form' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firstQuestion = questions[0];

    // Generate session token
    const sessionToken = uuidv4();

    // Create response record
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        form_id: formId,
        session_token: sessionToken,
        current_question_id: firstQuestion.id,
        status: 'in_progress',
      })
      .select()
      .single();

    if (responseError || !response) {
      console.error('Failed to create response:', responseError);
      return new Response(
        JSON.stringify({ error: 'Failed to start response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Response started:', { responseId: response.id, sessionToken });

    return new Response(
      JSON.stringify({
        sessionToken,
        responseId: response.id,
        form: {
          title: form.title,
          description: form.description,
        },
        question: firstQuestion,
        totalQuestions: questions.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in start-response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
