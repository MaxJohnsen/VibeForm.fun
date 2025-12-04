import { format, parseISO } from 'date-fns';
import { formatAnswerValue } from '@/features/analytics/utils/formatAnswerValue';

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  category: 'form' | 'question' | 'special';
}

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
 * This should match the backend version in supabase/functions/_shared/templateEngine.ts
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
      ? format(parseISO(response.completed_at), 'PPpp')
      : 'N/A',
    response_number: safeAnswers.length > 0 ? String(safeAnswers.length) : '1',
  };

  // Build all_answers text
  let allAnswersText = '';
  let allAnswersHtml = '';

  safeQuestions.forEach((question, index) => {
    const answer = safeAnswers.find(a => a.question_id === question.id);
    const formattedValue = answer 
      ? formatAnswerValue(answer.answer_value, question.type, question.settings, form?.language)
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
    safeQuestions.map((q) => ({
      question: q.label,
      answer: safeAnswers.find(a => a.question_id === q.id)?.answer_value || null
    })),
    null,
    2
  );

  return context;
}

/**
 * Get available template variables for a form
 */
export function getAvailableVariables(
  questions: any[]
): TemplateVariable[] {
  const variables: TemplateVariable[] = [
    // Form variables
    {
      key: 'form_title',
      label: 'Form Title',
      example: 'Customer Feedback Survey',
      category: 'form'
    },
    {
      key: 'form_slug',
      label: 'Form Slug',
      example: 'customer-feedback',
      category: 'form'
    },
    {
      key: 'response_id',
      label: 'Response ID',
      example: 'abc-123-def-456',
      category: 'form'
    },
    {
      key: 'submitted_at',
      label: 'Submission Time',
      example: 'Jan 15, 2024 2:30 PM',
      category: 'form'
    },
    {
      key: 'response_number',
      label: 'Response Number',
      example: '42',
      category: 'form'
    },
  ];

  // Add question variables in new format
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
    {
      key: 'all_answers',
      label: 'All Answers (Plain Text)',
      example: 'Question 1: Answer 1\nQuestion 2: Answer 2',
      category: 'special'
    },
    {
      key: 'all_answers_html',
      label: 'All Answers (HTML)',
      example: '<p><strong>Q1:</strong> A1</p>',
      category: 'special'
    },
    {
      key: 'all_answers_json',
      label: 'All Answers (JSON)',
      example: '[{"question":"Q1","answer":"A1"}]',
      category: 'special'
    }
  );

  return variables;
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
 * Get example value for question type
 */
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
