import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { checkRateLimit, getEnvInt } from '../_shared/ratelimit.ts';
import { jsonResponse, jsonError, rateLimitResponse } from '../_shared/responses.ts';
import { createServiceClient } from '../_shared/supabaseClient.ts';
import { navigateBackSchema, validateRequest } from '../_shared/validation.ts';

const RATE_LIMIT_PREFIX = 'navigate-back';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const body = await req.json();

    // Validate input with Zod
    const validation = validateRequest(navigateBackSchema, body);
    if (!validation.success) {
      return jsonError(`Invalid input: ${validation.error}`, 400);
    }

    const { sessionToken, currentQuestionId } = validation.data;

    // Rate limiting by session token (shared with submit-answer)
    const rateLimitResult = await checkRateLimit(sessionToken, {
      maxRequests: getEnvInt('RATE_LIMIT_SUBMIT_ANSWER', 30),
      prefix: RATE_LIMIT_PREFIX,
    });

    if (!rateLimitResult.success) {
      console.warn('Rate limit exceeded for session:', sessionToken);
      return rateLimitResponse(rateLimitResult.reset, rateLimitResult.limit);
    }

    const supabase = createServiceClient();

    // Get response record
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (responseError || !response) {
      console.error('Response not found:', responseError);
      return jsonError('Invalid session', 404);
    }

    // Delete answer for the current question
    const { error: deleteError } = await supabase
      .from('answers')
      .delete()
      .eq('response_id', response.id)
      .eq('question_id', currentQuestionId);

    if (deleteError) {
      console.error('Failed to delete answer:', deleteError);
      return jsonError('Failed to navigate back', 500);
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
      return jsonError('Failed to determine previous question', 500);
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
        return jsonError('Failed to fetch first question', 500);
      }

      targetQuestionId = firstQuestion.id;
    }

    // OPTIMIZATION: Parallelize final operations
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
      return jsonError('Failed to fetch target question', 500);
    }

    console.log('Navigated back to question:', targetQuestionId, '(deleted answer for question:', currentQuestionId, ')');

    // Normalize the existing answer - convert _skipped marker back to null
    const existingAnswer = existingAnswerResult.data?.answer_value;
    const normalizedAnswer = existingAnswer?._skipped === true ? null : (existingAnswer || null);

    return jsonResponse(
      {
        success: true,
        question: {
          ...targetQuestionResult.data,
          currentAnswer: normalizedAnswer,
        },
        totalQuestions: countResult.count || 0,
      },
      200,
      { 'Cache-Control': 'no-store' }
    );
  } catch (error) {
    console.error('Error in navigate-back:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(errorMessage, 500);
  }
});
