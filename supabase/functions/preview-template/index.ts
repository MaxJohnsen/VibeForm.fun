import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildTemplateContext, processTemplate } from '../_shared/templateEngine.ts';
import { corsHeaders, handleCorsOptions } from '../_shared/cors.ts';
import { jsonResponse, jsonError } from '../_shared/responses.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const { formId, templates } = await req.json();

    if (!formId) {
      return jsonError('formId is required', 400);
    }

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonError('Authorization header required', 401);
    }

    // Create user client for auth verification
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonError('Unauthorized', 401);
    }

    // Create admin client for lookups
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch form with workspace info
    const { data: form, error: formError } = await supabaseAdmin
      .from('forms')
      .select('*, workspace_id, created_by')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      console.error('Error fetching form:', formError);
      return jsonError('Form not found', 404);
    }

    // Verify workspace membership or ownership
    if (form.workspace_id) {
      const { data: isMember, error: memberError } = await supabaseAdmin.rpc(
        'is_workspace_member',
        { _workspace_id: form.workspace_id, _user_id: user.id }
      );

      if (memberError || !isMember) {
        console.error(`Workspace membership check failed for user ${user.id}`);
        return jsonError('Access denied', 403);
      }
    } else if (form.created_by !== user.id) {
      return jsonError('Access denied', 403);
    }

    // Fetch questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('form_id', formId)
      .order('position');

    if (questionsError) {
      console.error('Error fetching questions:', questionsError);
      return jsonError('Failed to fetch questions', 500);
    }

    const safeQuestions = questions || [];

    // Generate sample answers
    const sampleAnswers = safeQuestions.map((q) => ({
      id: `sample-${q.id}`,
      question_id: q.id,
      response_id: 'sample-response',
      answer_value: generateSampleAnswer(q.type, q.settings),
      answered_at: new Date().toISOString(),
    }));

    const sampleResponse = {
      id: 'sample-response-id',
      form_id: formId,
      completed_at: new Date().toISOString(),
      status: 'completed',
    };

    // Build template context using the single source of truth
    const context = buildTemplateContext(form, sampleResponse, safeQuestions, sampleAnswers);

    // Process any provided templates
    const processed: Record<string, string> = {};
    if (templates && typeof templates === 'object') {
      for (const [key, template] of Object.entries(templates)) {
        if (typeof template === 'string') {
          processed[key] = processTemplate(template, context);
        }
      }
    }

    // Generate available variables for UI
    const availableVariables = getAvailableVariables(safeQuestions);

    console.log(`Preview template generated for form ${formId} with ${safeQuestions.length} questions`);

    return jsonResponse({
      form,
      questions: safeQuestions,
      sampleAnswers,
      sampleResponse,
      context,
      processed,
      availableVariables,
    });
  } catch (error) {
    console.error('Preview template error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return jsonError(message, 500);
  }
});

/**
 * Generate sample answer based on question type
 */
function generateSampleAnswer(type: string, settings?: any): any {
  switch (type) {
    case 'short_text':
      return 'John Doe';
    case 'long_text':
      return 'This is a sample longer response.\nIt spans multiple lines.\nTo show how formatting works.';
    case 'email':
      return 'user@example.com';
    case 'phone':
      return '+1 (555) 123-4567';
    case 'respondent_name':
      return 'Jane Smith';
    case 'yes_no':
      return true;
    case 'rating':
      return settings?.max ? Math.floor(settings.max * 0.8) : 4;
    case 'multiple_choice':
      return settings?.choices?.[0] || 'Option A';
    case 'date':
      return new Date().toISOString().split('T')[0];
    default:
      return 'Sample answer';
  }
}

interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  category: 'form' | 'question' | 'special';
}

/**
 * Get available template variables for a form
 */
function getAvailableVariables(questions: any[]): TemplateVariable[] {
  const variables: TemplateVariable[] = [
    // Form variables
    { key: 'form_title', label: 'Form Title', example: 'Customer Feedback Survey', category: 'form' },
    { key: 'form_slug', label: 'Form Slug', example: 'customer-feedback', category: 'form' },
    { key: 'response_id', label: 'Response ID', example: 'abc-123-def-456', category: 'form' },
    { key: 'submitted_at', label: 'Submission Time', example: 'Jan 15, 2024 2:30 PM', category: 'form' },
    { key: 'response_number', label: 'Response Number', example: '42', category: 'form' },
  ];

  // Add question variables
  questions.forEach((question, index) => {
    const qNumber = index + 1;
    variables.push({
      key: `q${qNumber}_text`,
      label: `Q${qNumber}: ${question.label} (text)`,
      example: question.label,
      category: 'question'
    });
    variables.push({
      key: `q${qNumber}_answer`,
      label: `Q${qNumber}: ${question.label} (answer)`,
      example: getExampleValue(question.type),
      category: 'question'
    });
  });

  // Special variables
  variables.push(
    { key: 'all_answers', label: 'All Answers (Plain Text)', example: 'Question 1: Answer 1\nQuestion 2: Answer 2', category: 'special' },
    { key: 'all_answers_markdown', label: 'All Answers (Markdown)', example: '*Question 1* → Answer 1\n*Question 2* → Answer 2', category: 'special' },
    { key: 'all_answers_html', label: 'All Answers (HTML)', example: '<p><strong>Q1:</strong> A1</p>', category: 'special' },
    { key: 'all_answers_json', label: 'All Answers (JSON)', example: '[{"question":"Q1","answer":"A1"}]', category: 'special' }
  );

  return variables;
}

function getExampleValue(type: string): string {
  const examples: Record<string, string> = {
    short_text: 'John Doe',
    long_text: 'This is a longer text response...',
    email: 'user@example.com',
    phone: '+1 (555) 123-4567',
    yes_no: 'Yes',
    rating: '4/5',
    multiple_choice: 'Option A',
    date: 'Jan 15, 2024',
    respondent_name: 'Jane Smith'
  };
  return examples[type] || 'Sample answer';
}
