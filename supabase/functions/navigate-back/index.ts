import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

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
      console.error('Response not found:', responseError);
      return new Response(
        JSON.stringify({ error: 'Invalid session' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all questions for the form
    const { data: allQuestions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', response.form_id)
      .order('position', { ascending: true });

    if (questionsError || !allQuestions) {
      console.error('Failed to fetch questions:', questionsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch questions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all current answers
    const { data: currentAnswers, error: answersError } = await supabase
      .from('answers')
      .select('question_id')
      .eq('response_id', response.id)
      .eq('is_current', true)
      .order('answered_at', { ascending: true });

    if (answersError) {
      console.error('Failed to fetch answers:', answersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch answers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!currentAnswers || currentAnswers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No previous answers found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the last answered question
    const lastAnsweredQuestionId = currentAnswers[currentAnswers.length - 1].question_id;

    // Mark the last answer as not current
    const { error: updateAnswerError } = await supabase
      .from('answers')
      .update({ is_current: false })
      .eq('response_id', response.id)
      .eq('question_id', lastAnsweredQuestionId)
      .eq('is_current', true);

    if (updateAnswerError) {
      console.error('Failed to update answer:', updateAnswerError);
      return new Response(
        JSON.stringify({ error: 'Failed to navigate back' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the previous question
    const { data: previousQuestion, error: prevQuestionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', lastAnsweredQuestionId)
      .single();

    if (prevQuestionError || !previousQuestion) {
      console.error('Failed to fetch previous question:', prevQuestionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch previous question' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update response record
    const { error: updateError } = await supabase
      .from('responses')
      .update({
        current_question_id: lastAnsweredQuestionId,
        status: 'in_progress',
        completed_at: null,
      })
      .eq('id', response.id);

    if (updateError) {
      console.error('Failed to update response:', updateError);
    }

    console.log('Navigated back to question:', lastAnsweredQuestionId);

    return new Response(
      JSON.stringify({
        success: true,
        question: previousQuestion,
        totalQuestions: allQuestions.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in navigate-back:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
