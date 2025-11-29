import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildTemplateContext, processTemplate } from '@/shared/utils/templateEngine';

export const useTemplatePreview = (formId: string) => {
  return useQuery({
    queryKey: ['template-preview', formId],
    queryFn: async () => {
      // Fetch form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;

      // Fetch questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('form_id', formId)
        .order('position');

      if (questionsError) throw questionsError;

      // Generate sample response
      const sampleAnswers = questions.map((q) => ({
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

      // Build template context
      const context = buildTemplateContext(form, sampleResponse, questions, sampleAnswers);

      return {
        form,
        questions,
        sampleAnswers,
        sampleResponse,
        context,
        processTemplate: (template: string) => processTemplate(template, context),
      };
    },
  });
};

function generateSampleAnswer(type: string, settings?: any): any {
  switch (type) {
    case 'short_text':
      return 'John Doe';
    case 'long_text':
      return 'This is a sample longer text response that the user might provide.';
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
