import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { isValidFormId, isUUID } from '../_shared/formUtils.ts';
import { checkRateLimit, getEnvInt } from '../_shared/ratelimit.ts';
import { jsonResponse, jsonError, rateLimitResponse } from '../_shared/responses.ts';
import { createServiceClient } from '../_shared/supabaseClient.ts';
import { getClientIP } from '../_shared/httpUtils.ts';

const RATE_LIMIT_PREFIX = 'get-form-info';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const { formId } = await req.json();

    if (!formId) {
      return jsonError('formId is required', 400);
    }

    if (!isValidFormId(formId)) {
      return jsonError('Invalid formId format', 400);
    }

    // Rate limiting by IP (high limit for conference scenarios)
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit(clientIP, {
      maxRequests: getEnvInt('RATE_LIMIT_GET_FORM_INFO', 500),
      prefix: RATE_LIMIT_PREFIX,
    });

    if (!rateLimitResult.success) {
      console.warn('Rate limit exceeded for IP:', clientIP);
      return rateLimitResponse(rateLimitResult.reset, rateLimitResult.limit);
    }

    const supabase = createServiceClient();

    console.log('Fetching form info for:', formId);

    // Fetch form by UUID or slug
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, intro_settings, end_settings, language, status')
      .or(isUUID(formId) ? `id.eq.${formId}` : `slug.eq.${formId}`)
      .single();

    if (formError || !form) {
      console.error('Form not found:', formError);
      return jsonError('Form not found', 404);
    }

    if (form.status !== 'active') {
      return jsonError('Form is not active', 400);
    }

    // Count questions
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('form_id', form.id);

    if (countError) {
      console.error('Failed to count questions:', countError);
    }

    // Check if Turnstile is configured on the backend
    const turnstileEnabled = Boolean(Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET'));

    console.log('Form info retrieved:', { formId: form.id, totalQuestions: count, turnstileEnabled });

    return jsonResponse({
      form: {
        title: form.title,
        intro_settings: form.intro_settings || {},
        end_settings: form.end_settings || {},
        language: form.language || 'en',
      },
      totalQuestions: count || 0,
      turnstileEnabled,
    });
  } catch (error) {
    console.error('Error in get-form-info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return jsonError(errorMessage, 500);
  }
});
