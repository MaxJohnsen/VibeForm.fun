import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';
import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { isUUID } from '../_shared/formUtils.ts';
import { checkRateLimit, getEnvInt } from '../_shared/ratelimit.ts';
import { jsonResponse, jsonError, rateLimitResponse } from '../_shared/responses.ts';
import { createServiceClient } from '../_shared/supabaseClient.ts';
import { getClientIP } from '../_shared/httpUtils.ts';
import { verifyTurnstile } from '../_shared/turnstile.ts';
import { startResponseSchema, validateRequest } from '../_shared/validation.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimitConfig = {
      maxRequests: getEnvInt('RATE_LIMIT_START_RESPONSE', 10),
      prefix: 'ratelimit:start-response',
    };
    
    const { success, limit, remaining, reset } = await checkRateLimit(clientIP, rateLimitConfig);
    
    if (!success) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return rateLimitResponse(reset, limit);
    }

    const body = await req.json();
    
    // Validate input with Zod
    const validation = validateRequest(startResponseSchema, body);
    if (!validation.success) {
      return jsonError(`Invalid input: ${validation.error}`, 400);
    }
    
    const { formId, turnstileToken } = validation.data;

    // Check if Turnstile is configured on server
    const turnstileSecret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET');

    if (turnstileSecret) {
      if (!turnstileToken) {
        console.warn(`Missing Turnstile token from IP: ${clientIP}`);
        return jsonError('Verification token required', 403);
      }

      const isHuman = await verifyTurnstile(turnstileToken, clientIP, turnstileSecret);
      if (!isHuman) {
        console.warn(`Turnstile verification failed for IP: ${clientIP}`);
        return jsonError('Verification failed. Please refresh and try again.', 403);
      }
      console.log(`Turnstile verified for IP: ${clientIP}`);
    } else {
      console.log('Turnstile not configured, skipping verification');
    }

    const supabase = createServiceClient();

    console.log('Starting response for form:', formId);

    // Verify form exists and is active
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, description, status, intro_settings, end_settings, language')
      .or(isUUID(formId) ? `id.eq.${formId}` : `slug.eq.${formId}`)
      .single();

    if (formError || !form) {
      console.error('Form not found:', formError);
      return jsonError('Form not found', 404);
    }

    if (form.status !== 'active') {
      return jsonError('Form is not active');
    }

    // Get all questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', form.id)
      .order('position', { ascending: true });

    if (questionsError || !questions || questions.length === 0) {
      console.error('No questions found:', questionsError);
      return jsonError('No questions found for this form', 404);
    }

    const firstQuestion = questions[0];
    const sessionToken = uuidv4();

    // Create response record
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .insert({
        form_id: form.id,
        session_token: sessionToken,
        current_question_id: firstQuestion.id,
        status: 'in_progress',
      })
      .select()
      .single();

    if (responseError || !response) {
      console.error('Failed to create response:', responseError);
      return jsonError('Failed to start response', 500);
    }

    console.log('Response started:', { responseId: response.id, sessionToken });

    // Check for existing answer for first question
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('answer_value')
      .eq('response_id', response.id)
      .eq('question_id', firstQuestion.id)
      .maybeSingle();

    const extraHeaders: Record<string, string> = {};
    if (limit > 0) {
      extraHeaders['X-RateLimit-Limit'] = limit.toString();
      extraHeaders['X-RateLimit-Remaining'] = remaining.toString();
    }

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
        ...firstQuestion,
        currentAnswer: existingAnswer?.answer_value || null,
      },
      totalQuestions: questions.length,
    }, 200, extraHeaders);

  } catch (error) {
    console.error('Error in start-response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(errorMessage, 500);
  }
});
