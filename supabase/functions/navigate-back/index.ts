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
    const { sessionToken, currentQuestionId } = await req.json();

    if (!sessionToken || !currentQuestionId) {
      return new Response(
        JSON.stringify({ error: 'sessionToken and currentQuestionId are required' }),
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

    // Delete answer for the current question (if exists)
    const { error: deleteError } = await supabase
      .from('answers')
      .delete()
      .eq('response_id', response.id)
      .eq('question_id', currentQuestionId);

    if (deleteError) {
      console.error('Failed to delete answer:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to navigate back' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the most recently answered question (by timestamp)
    const { data: lastAnswer, error: lastAnswerError } = await supabase
      .from('answers')
      .select('question_id')
      .eq('response_id', response.id)
      .order('answered_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastAnswerError) {
      console.error('Failed to fetch last answer:', lastAnswerError);
      return new Response(
        JSON.stringify({ error: 'Failed to determine previous question' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine which question to navigate to
    let targetQuestionId: string;
    
    if (lastAnswer) {
      // Navigate to the most recently answered question
      targetQuestionId = lastAnswer.question_id;
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

    console.log('Navigated back to question:', targetQuestionId, '(deleted answer for question:', currentQuestionId, ')');

    // Fetch existing answer for the target question
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('answer_value')
      .eq('response_id', response.id)
      .eq('question_id', targetQuestion.id)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        question: {
          ...targetQuestion,
          currentAnswer: existingAnswer?.answer_value || null,
        },
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
