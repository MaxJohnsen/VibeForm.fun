import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';
import { Ratelimit } from 'https://esm.sh/@upstash/ratelimit@2.0.5';
import { Redis } from 'https://esm.sh/@upstash/redis@1.34.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize rate limiter with Upstash Redis
const redis = new Redis({
  url: Deno.env.get('UPSTASH_REDIS_REST_URL')!,
  token: Deno.env.get('UPSTASH_REDIS_REST_TOKEN')!,
});

// Sliding window: 10 requests per 60 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'ratelimit:start-response',
});

// Get client IP from request headers
function getClientIP(req: Request): string {
  // Supabase edge functions provide the real IP in x-forwarded-for
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  // Fallback to x-real-ip
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  // Last resort fallback
  return 'unknown';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const { success, limit, remaining, reset } = await ratelimit.limit(clientIP);
    
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

    const { formId } = await req.json();

    if (!formId) {
      return new Response(
        JSON.stringify({ error: 'formId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic input validation: formId should be a UUID or a slug (alphanumeric with dashes)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const slugPattern = /^[a-z0-9][a-z0-9-]{0,98}[a-z0-9]$/i;
    
    if (!uuidPattern.test(formId) && !slugPattern.test(formId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid formId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting response for form:', formId);

    // Check if formId is a UUID or a slug
    const isUUID = uuidPattern.test(formId);

    // Verify form exists and is active - try by UUID first, then by slug
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, description, status, intro_settings, end_settings, language')
      .or(isUUID ? `id.eq.${formId}` : `slug.eq.${formId}`)
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
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
        } 
      }
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
