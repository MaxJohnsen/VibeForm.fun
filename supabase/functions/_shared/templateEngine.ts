import { format } from 'https://esm.sh/date-fns@3.6.0';

export interface TemplateContext {
  [key: string]: string | number | undefined;
}

/**
 * Process template with {{variable}} syntax
 */
export function processTemplate(
  template: string,
  context: TemplateContext
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmedVar = varName.trim();
    return context[trimmedVar] !== undefined 
      ? String(context[trimmedVar]) 
      : match;
  });
}

/**
 * Build template context from response data
 */
export function buildTemplateContext(
  form: any,
  response: any,
  questions: any[],
  answers: any[]
): TemplateContext {
  const context: TemplateContext = {
    // Form-level variables
    form_title: form?.title || 'Untitled Form',
    form_slug: form?.slug || '',
    response_id: response?.id || '',
    submitted_at: response?.completed_at 
      ? format(new Date(response.completed_at), 'PPpp')
      : 'N/A',
    response_number: String(answers?.length || 0),
  };

  // Build all_answers text
  let allAnswersText = '';
  let allAnswersHtml = '';

  questions.forEach((question, index) => {
    const answer = answers.find(a => a.question_id === question.id);
    const formattedValue = answer 
      ? formatAnswerValue(answer.answer_value)
      : '(not answered)';

    // Add question-specific variables in new format: q1_text, q1_answer, etc.
    const qNumber = index + 1;
    context[`q${qNumber}_text`] = question.label;
    context[`q${qNumber}_answer`] = formattedValue;

    // Build all_answers string
    allAnswersText += `${question.label}: ${formattedValue}\n`;
    allAnswersHtml += `<p><strong>${question.label}:</strong> ${formattedValue}</p>`;
  });

  context.all_answers = allAnswersText.trim();
  context.all_answers_html = allAnswersHtml;
  context.all_answers_json = JSON.stringify(
    questions.map((q) => ({
      question: q.label,
      answer: answers.find(a => a.question_id === q.id)?.answer_value || null
    })),
    null,
    2
  );

  return context;
}

/**
 * Slugify text for variable names
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);
}

/**
 * Format answer value for display
 */
function formatAnswerValue(value: any): string {
  if (value === null || value === undefined) return 'No answer';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
