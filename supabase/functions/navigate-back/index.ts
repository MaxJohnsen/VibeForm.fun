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

    // Get all answers ordered by submission time
    const { data: allAnswers, error: answersError } = await supabase
      .from('answers')
      .select('id, question_id')
      .eq('response_id', response.id)
      .order('answered_at', { ascending: true });

    if (answersError) {
      console.error('Failed to fetch answers:', answersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch answers' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!allAnswers || allAnswers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No previous answers to navigate back from' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the last answer to delete
    const lastAnswer = allAnswers[allAnswers.length - 1];

    // Delete the last answer
    const { error: deleteError } = await supabase
      .from('answers')
      .delete()
      .eq('id', lastAnswer.id);

    if (deleteError) {
      console.error('Failed to delete answer:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to navigate back' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which question to navigate to
    let targetQuestionId: string;
    
    if (allAnswers.length > 1) {
      // Navigate to the question of the now-last answer
      targetQuestionId = allAnswers[allAnswers.length - 2].question_id;
    } else {
      // No more answers, navigate to first question
      targetQuestionId = allQuestions[0].id;
    }

    // Get the target question
    const { data: targetQuestion, error: targetQuestionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', targetQuestionId)
      .single();

    if (targetQuestionError || !targetQuestion) {
      console.error('Failed to fetch target question:', targetQuestionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch target question' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update response record
    const { error: updateError } = await supabase
      .from('responses')
      .update({
        current_question_id: targetQuestionId,
        status: 'in_progress',
        completed_at: null,
      })
      .eq('id', response.id);

    if (updateError) {
      console.error('Failed to update response:', updateError);
    }

    console.log('Navigated back to question:', targetQuestionId, '(deleted answer for question:', lastAnswer.question_id, ')');

    return new Response(
      JSON.stringify({
        success: true,
        question: targetQuestion,
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
