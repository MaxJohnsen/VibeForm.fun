import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ error: 'sessionToken is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get response record
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (responseError || !response) {
      console.log('Session not found:', sessionToken);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired session' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get form details
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('title, description')
      .eq('id', response.form_id)
      .single();

    if (formError || !form) {
      console.error('Form not found:', formError);
      return new Response(
        JSON.stringify({ error: 'Form not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get total questions count
    const { count: totalQuestions, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', response.form_id);

    if (countError) {
      console.error('Failed to count questions:', countError);
    }

    // If completed, return completion status
    if (response.status === 'completed') {
      console.log('Session already completed:', sessionToken);
      return new Response(
        JSON.stringify({
          sessionToken,
          responseId: response.id,
          form: { title: form.title, description: form.description },
          isComplete: true,
          totalQuestions: totalQuestions || 0,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current question
    let currentQuestion = null;
    if (response.current_question_id) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', response.current_question_id)
        .single();

      if (!error && data) {
        currentQuestion = data;
      }
    }

    // If no current question, get the first question
    if (!currentQuestion) {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', response.form_id)
        .order('position', { ascending: true })
        .limit(1)
        .single();

      if (!error && data) {
        currentQuestion = data;
        
        // Update response with first question
        await supabase
          .from('responses')
          .update({ current_question_id: data.id })
          .eq('id', response.id);
      }
    }

    if (!currentQuestion) {
      return new Response(
        JSON.stringify({ error: 'No questions found for this form' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Session resumed:', { sessionToken, questionId: currentQuestion.id });

    return new Response(
      JSON.stringify({
        sessionToken,
        responseId: response.id,
        form: { title: form.title, description: form.description },
        question: currentQuestion,
        totalQuestions: totalQuestions || 0,
        isComplete: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in resume-response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
