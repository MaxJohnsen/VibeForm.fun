import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { isValidFormId, isUUID } from '../_shared/formUtils.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const { formId } = await req.json();

    if (!formId) {
      return new Response(
        JSON.stringify({ error: 'formId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    console.log('Fetching form info for:', formId);

    // Fetch form by UUID or slug
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, title, intro_settings, end_settings, language, status')
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

    return new Response(
      JSON.stringify({
        form: {
          title: form.title,
          intro_settings: form.intro_settings || {},
          end_settings: form.end_settings || {},
          language: form.language || 'en',
        },
        totalQuestions: count || 0,
        turnstileEnabled,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-form-info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
