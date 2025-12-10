import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { checkRateLimit, getEnvInt } from '../_shared/ratelimit.ts';
import { jsonResponse, jsonError, rateLimitResponse } from '../_shared/responses.ts';
import { createServiceClient } from '../_shared/supabaseClient.ts';
import { evaluateRule, QuestionLogic } from '../_shared/logic.ts';
import { submitAnswerSchema, validateRequest } from '../_shared/validation.ts';

// EdgeRuntime global for background task management
declare const EdgeRuntime: {
  waitUntil(promise: Promise<any>): void;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const body = await req.json();

    // Validate input with Zod
    const validation = validateRequest(submitAnswerSchema, body);
    if (!validation.success) {
      return jsonError(`Invalid input: ${validation.error}`, 400);
    }

    const { sessionToken, questionId, answerValue } = validation.data;

    // Rate limiting by session token
    const rateLimitConfig = {
      maxRequests: getEnvInt('RATE_LIMIT_SUBMIT_ANSWER', 60),
      prefix: 'ratelimit:submit-answer',
    };
    
    const { success, limit, remaining, reset } = await checkRateLimit(sessionToken, rateLimitConfig);
    
    if (!success) {
      console.warn(`Rate limit exceeded for session: ${sessionToken.substring(0, 8)}...`);
      return rateLimitResponse(reset, limit, 'Too many requests. Please slow down.');
    }

    const supabase = createServiceClient();

    // Parallelize initial queries
    const [responseResult, questionResult] = await Promise.all([
      supabase.from('responses').select('*').eq('session_token', sessionToken).single(),
      supabase.from('questions').select('*').eq('id', questionId).single()
    ]);

    if (responseResult.error || !responseResult.data) {
      console.error('Response not found:', responseResult.error);
      return jsonError('Invalid session', 404);
    }

    if (questionResult.error || !questionResult.data) {
      console.error('Question not found:', questionResult.error);
      return jsonError('Question not found', 404);
    }

    const response = responseResult.data;
    const currentQuestion = questionResult.data;

    // Save or update answer using UPSERT
    const isEmptyOrWhitespace = typeof answerValue === 'string' && answerValue.trim() === '';
    const valueToStore = (answerValue === null || answerValue === undefined || isEmptyOrWhitespace) 
      ? { _skipped: true } 
      : answerValue;
    
    console.log('Saving answer:', { questionId, answerValue, valueToStore });
    
    const { error: answerError } = await supabase
      .from('answers')
      .upsert({
        response_id: response.id,
        question_id: questionId,
        answer_value: valueToStore,
        answered_at: new Date().toISOString(),
      }, {
        onConflict: 'response_id,question_id'
      });

    if (answerError) {
      console.error('Failed to save answer:', answerError);
      return jsonError('Failed to save answer', 500);
    }

    // Evaluate logic to determine next question
    const logic = currentQuestion.logic as QuestionLogic | null;
    let nextQuestionId: string | null = null;
    let isComplete = false;

    if (logic?.rules && logic.rules.length > 0) {
      for (const rule of logic.rules) {
        if (evaluateRule(rule, answerValue)) {
          if (rule.action.type === 'end') {
            isComplete = true;
            break;
          } else if (rule.action.type === 'jump' && rule.action.target_question_id) {
            nextQuestionId = rule.action.target_question_id;
            break;
          }
        }
      }
    }

    // If no rule matched, apply default action
    if (!isComplete && !nextQuestionId && logic) {
      if (logic.default_action === 'end') {
        isComplete = true;
      } else if (logic.default_target) {
        nextQuestionId = logic.default_target;
      }
    }

    // Fetch questions if we need sequential flow
    if (!isComplete && !nextQuestionId) {
      const { data: allQuestions, error: allQuestionsError } = await supabase
        .from('questions')
        .select('id, position')
        .eq('form_id', response.form_id)
        .order('position', { ascending: true });

      if (allQuestionsError) {
        console.error('Failed to fetch questions:', allQuestionsError);
        return jsonError('Failed to evaluate logic', 500);
      }
      
      const currentIndex = allQuestions.findIndex(q => q.id === questionId);
      if (currentIndex >= 0 && currentIndex < allQuestions.length - 1) {
        nextQuestionId = allQuestions[currentIndex + 1].id;
      } else {
        isComplete = true;
      }
    }

    // Parallelize final operations
    const updateData: Record<string, any> = {
      current_question_id: nextQuestionId,
    };

    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    const parallelOps: Promise<any>[] = [
      (async () => supabase.from('responses').update(updateData).eq('id', response.id))(),
      (async () => supabase.from('questions').select('id', { count: 'exact', head: true }).eq('form_id', response.form_id))(),
    ];

    if (!isComplete && nextQuestionId) {
      parallelOps.push(
        (async () => supabase.from('questions').select('*').eq('id', nextQuestionId).single())(),
        (async () => supabase.from('answers').select('answer_value').eq('response_id', response.id).eq('question_id', nextQuestionId).maybeSingle())()
      );
    }

    const results = await Promise.all(parallelOps);
    
    const updateResult = results[0];
    const countResult = results[1];
    const nextQuestionResult = !isComplete && nextQuestionId ? results[2] : null;
    const existingAnswerResult = !isComplete && nextQuestionId ? results[3] : null;

    if (updateResult.error) {
      console.error('Failed to update response:', updateResult.error);
    }

    let nextQuestion = null;
    if (!isComplete && nextQuestionId && nextQuestionResult?.data) {
      const existingAnswer = existingAnswerResult?.data?.answer_value;
      const normalizedAnswer = existingAnswer?._skipped === true ? null : (existingAnswer || null);
      
      nextQuestion = {
        ...nextQuestionResult.data,
        currentAnswer: normalizedAnswer,
      };
    }

    const totalQuestions = countResult.count || 0;

    console.log('Answer submitted:', { questionId, nextQuestionId, isComplete });

    // Trigger integrations in background if form is complete
    if (isComplete) {
      const internalSecret = Deno.env.get('INTERNAL_FUNCTIONS_SECRET');
      EdgeRuntime.waitUntil(
        supabase.functions.invoke('process-integrations', {
          body: { formId: response.form_id, responseId: response.id },
          headers: { 'x-internal-token': internalSecret || '' },
        }).then(({ data, error }) => {
          if (error) {
            console.error('Error processing integrations:', error);
          } else {
            console.log('Integrations processed:', data);
          }
        })
      );
    }

    const extraHeaders: Record<string, string> = { 'Cache-Control': 'no-store' };
    if (limit > 0) {
      extraHeaders['X-RateLimit-Limit'] = limit.toString();
      extraHeaders['X-RateLimit-Remaining'] = remaining.toString();
    }

    return jsonResponse({
      success: true,
      isComplete,
      nextQuestion,
      totalQuestions,
    }, 200, extraHeaders);

  } catch (error) {
    console.error('Error in submit-answer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(errorMessage, 500);
  }
});
