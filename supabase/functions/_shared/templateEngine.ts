import { format } from 'https://esm.sh/date-fns@3.6.0';
import { formatAnswerValue } from './formatters.ts';

export interface TemplateContext {
  [key: string]: string | number | undefined;
}

/**
 * Process template with {{variable}} syntax
 * Keeps original {{variable}} if not found in context (for debugging)
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
 * This should match the frontend version in src/shared/utils/templateEngine.ts
 */
export function buildTemplateContext(
  form: any,
  response: any,
  questions: any[],
  answers: any[]
): TemplateContext {
  const safeQuestions = questions || [];
  const safeAnswers = answers || [];
  
  const context: TemplateContext = {
    // Form-level variables (with null safety)
    form_title: form?.title || 'Untitled Form',
    form_slug: form?.slug || '',
    response_id: response?.id || '',
    submitted_at: response?.completed_at 
      ? format(new Date(response.completed_at), 'PPpp')
      : 'N/A',
    // Match frontend: use answers count, fallback to 1 if empty
    response_number: safeAnswers.length > 0 ? String(safeAnswers.length) : '1',
  };

  // Build all_answers text
  let allAnswersText = '';
  let allAnswersHtml = '';
  let allAnswersMarkdown = '';

  safeQuestions.forEach((question, index) => {
    const answer = safeAnswers.find(a => a.question_id === question.id);
    const formattedValue = answer 
      ? formatAnswerValue(answer.answer_value, question.type, question.settings)
      : '(not answered)';

    // Add question-specific variables in new format: q1_text, q1_answer, etc.
    const qNumber = index + 1;
    context[`q${qNumber}_text`] = question.label;
    context[`q${qNumber}_answer`] = formattedValue;

    // Build all_answers string (plain text)
    allAnswersText += `${question.label}: ${formattedValue}\n`;
    
    // Build all_answers HTML
    allAnswersHtml += `<p><strong>${question.label}:</strong> ${formattedValue}</p>`;
    
    // Build all_answers markdown (good visual hierarchy for Slack/Discord)
    allAnswersMarkdown += `*${question.label}*\n`;
    if (question.type === 'long_text' && formattedValue.includes('\n')) {
      // Quote block for multi-line answers
      const quotedValue = formattedValue
        .split('\n')
        .map((line: string) => `> ${line}`)
        .join('\n');
      allAnswersMarkdown += `${quotedValue}\n\n`;
    } else {
      allAnswersMarkdown += `${formattedValue}\n\n`;
    }
  });

  context.all_answers = allAnswersText.trim();
  context.all_answers_html = allAnswersHtml;
  context.all_answers_markdown = allAnswersMarkdown.trim();
  context.all_answers_json = JSON.stringify(
    safeQuestions.map((q) => ({
      question: q.label,
      answer: safeAnswers.find(a => a.question_id === q.id)?.answer_value || null
    })),
    null,
    2
  );

  return context;
}

// Re-export formatAnswerValue for convenience
export { formatAnswerValue };
