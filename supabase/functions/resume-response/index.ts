import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { checkRateLimit, getEnvInt } from '../_shared/ratelimit.ts';
import { jsonResponse, jsonError, rateLimitResponse } from '../_shared/responses.ts';
import { createServiceClient } from '../_shared/supabaseClient.ts';
import { resumeResponseSchema, validateRequest } from '../_shared/validation.ts';

const RATE_LIMIT_PREFIX = 'resume-response';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const body = await req.json();

    // Validate input with Zod
    const validation = validateRequest(resumeResponseSchema, body);
    if (!validation.success) {
      return jsonError(`Invalid input: ${validation.error}`, 400);
    }

    const { sessionToken } = validation.data;

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
      console.log('Session not found:', sessionToken);
      return jsonError('Invalid or expired session', 404);
    }

    // Get form details
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('title, description, intro_settings, end_settings, language')
      .eq('id', response.form_id)
      .single();

    if (formError || !form) {
      console.error('Form not found:', formError);
      return jsonError('Form not found', 404);
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
      return jsonResponse({
        sessionToken,
        responseId: response.id,
        form: {
          title: form.title,
          intro_settings: form.intro_settings || {},
          end_settings: form.end_settings || {},
          language: form.language || 'en',
        },
        isComplete: true,
        totalQuestions: totalQuestions || 0,
      });
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
      return jsonError('No questions found for this form', 404);
    }

    console.log('Session resumed:', { sessionToken, questionId: currentQuestion.id });

    // Fetch existing answer for current question
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('answer_value')
      .eq('response_id', response.id)
      .eq('question_id', currentQuestion.id)
      .maybeSingle();

    // Convert skipped marker back to null
    const currentAnswer = existingAnswer?.answer_value;
    const normalizedAnswer = currentAnswer?._skipped === true ? null : (currentAnswer || null);

    return jsonResponse({
      sessionToken,
      responseId: response.id,
      form: { 
        title: form.title, 
        intro_settings: form.intro_settings || {},
        end_settings: form.end_settings || {},
        language: form.language || 'en',
      },
      question: {
        ...currentQuestion,
        currentAnswer: normalizedAnswer,
      },
      totalQuestions: totalQuestions || 0,
      isComplete: false,
    });
  } catch (error) {
    console.error('Error in resume-response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(errorMessage, 500);
  }
});
