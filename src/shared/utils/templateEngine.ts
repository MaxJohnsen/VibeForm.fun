/**
 * Template Engine - Frontend utilities
 * 
 * Note: Template processing (buildTemplateContext, processTemplate) is handled by
 * the backend edge function (preview-template) to maintain a single source of truth.
 * This file only contains UI-specific utilities for displaying available variables.
 */

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  category: 'form' | 'question' | 'special';
}

/**
 * Get available template variables for a form
 * Used by VariablePicker to show users what variables they can use
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
 * Get example value for question type
 * Used for displaying placeholder examples in the variable picker
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
