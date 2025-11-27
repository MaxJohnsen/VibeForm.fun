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

    // Delete answer for the current question
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
      // OPTIMIZATION: Only fetch first question when needed (no more answers)
      const { data: firstQuestion, error: firstQuestionError } = await supabase
        .from('questions')
        .select('id')
        .eq('form_id', response.form_id)
        .order('position', { ascending: true })
        .limit(1)
        .single();

      if (firstQuestionError || !firstQuestion) {
        console.error('Failed to fetch first question:', firstQuestionError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch first question' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      targetQuestionId = firstQuestion.id;
    }

    // OPTIMIZATION: Parallelize final operations
    // 1. Update response record
    // 2. Fetch target question
    // 3. Fetch existing answer for target question
    // 4. Get total question count
    const [updateResult, targetQuestionResult, existingAnswerResult, countResult] = await Promise.all([
      (async () => supabase.from('responses').update({
        current_question_id: targetQuestionId,
        status: 'in_progress',
        completed_at: null,
      }).eq('id', response.id))(),
      (async () => supabase.from('questions').select('*').eq('id', targetQuestionId).single())(),
      (async () => supabase.from('answers').select('answer_value').eq('response_id', response.id).eq('question_id', targetQuestionId).maybeSingle())(),
      (async () => supabase.from('questions').select('id', { count: 'exact', head: true }).eq('form_id', response.form_id))()
    ]);

    if (updateResult.error) {
      console.error('Failed to update response:', updateResult.error);
    }

    if (targetQuestionResult.error || !targetQuestionResult.data) {
      console.error('Failed to fetch target question:', targetQuestionResult.error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch target question' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Navigated back to question:', targetQuestionId, '(deleted answer for question:', currentQuestionId, ')');

    // Normalize the existing answer - convert _skipped marker back to null
    const existingAnswer = existingAnswerResult.data?.answer_value;
    const normalizedAnswer = existingAnswer?._skipped === true ? null : (existingAnswer || null);

    return new Response(
      JSON.stringify({
        success: true,
        question: {
          ...targetQuestionResult.data,
          currentAnswer: normalizedAnswer,
        },
        totalQuestions: countResult.count || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
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
