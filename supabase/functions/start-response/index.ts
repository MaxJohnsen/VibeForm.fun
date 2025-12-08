import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';
import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { isValidFormId, isUUID } from '../_shared/formUtils.ts';
import { checkRateLimit, getEnvInt } from '../_shared/ratelimit.ts';

// Get client IP from request headers
function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  // Validate token length (max 2048 per Cloudflare docs)
  if (!token || token.length > 2048) {
    console.warn('Invalid Turnstile token format:', { length: token?.length });
    return false;
  }

  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    formData.append('remoteip', ip);

    const result = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      { method: 'POST', body: formData }
    );

    const outcome = await result.json();
    
    if (outcome.success) {
      console.log('Turnstile verified:', { 
        hostname: outcome.hostname,
        challenge_ts: outcome.challenge_ts 
      });
    } else {
      console.warn('Turnstile verification failed:', { 
        errorCodes: outcome['error-codes'],
        hostname: outcome.hostname 
      });
    }
    
    return outcome.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    // Rate limiting check (configurable via RATE_LIMIT_START_RESPONSE, default: 10)
    const clientIP = getClientIP(req);
    const rateLimitConfig = {
      maxRequests: getEnvInt('RATE_LIMIT_START_RESPONSE', 10),
      prefix: 'ratelimit:start-response',
    };
    
    const { success, limit, remaining, reset } = await checkRateLimit(clientIP, rateLimitConfig);
    
    if (!success) {
      console.warn(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          } 
        }
      );
    }

    const { formId, turnstileToken } = await req.json();

    if (!formId) {
      return new Response(
        JSON.stringify({ error: 'formId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Turnstile is configured on server
    const turnstileSecret = Deno.env.get('CLOUDFLARE_TURNSTILE_SECRET');

    if (turnstileSecret) {
      // Turnstile is configured - token is REQUIRED
      if (!turnstileToken) {
        console.warn(`Missing Turnstile token from IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ error: 'Verification token required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isHuman = await verifyTurnstile(turnstileToken, clientIP, turnstileSecret);
      if (!isHuman) {
        console.warn(`Turnstile verification failed for IP: ${clientIP}`);
        return new Response(
          JSON.stringify({ error: 'Verification failed. Please refresh and try again.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log(`Turnstile verified for IP: ${clientIP}`);
    } else {
      // Turnstile not configured - graceful degradation (dev mode)
      console.log('Turnstile not configured, skipping verification');
    }

    if (!isValidFormId(formId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid formId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting response for form:', formId);

    // Verify form exists and is active - try by UUID first, then by slug
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, description, status, intro_settings, end_settings, language')
      .or(isUUID(formId) ? `id.eq.${formId}` : `slug.eq.${formId}`)
      .single();

    if (formError || !form) {
      console.error('Form not found:', formError);
      return new Response(
        JSON.stringify({ error: 'Form not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (form.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Form is not active' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get first question (use form.id from the database, not the input formId which might be a slug)
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('form_id', form.id)
      .order('position', { ascending: true });

    if (questionsError || !questions || questions.length === 0) {
      console.error('No questions found:', questionsError);
      return new Response(
        JSON.stringify({ error: 'No questions found for this form' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firstQuestion = questions[0];

    // Generate session token
    const sessionToken = uuidv4();

    // Create response record (use form.id from database)
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
      return new Response(
        JSON.stringify({ error: 'Failed to start response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Response started:', { responseId: response.id, sessionToken });

    // Check for existing answer for the first question
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('answer_value')
      .eq('response_id', response.id)
      .eq('question_id', firstQuestion.id)
      .maybeSingle();

    const responseHeaders: Record<string, string> = {
      ...corsHeaders,
      'Content-Type': 'application/json',
    };
    
    // Only include rate limit headers if rate limiting is enabled
    if (limit > 0) {
      responseHeaders['X-RateLimit-Limit'] = limit.toString();
      responseHeaders['X-RateLimit-Remaining'] = remaining.toString();
    }

    return new Response(
      JSON.stringify({
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
      }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Error in start-response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
