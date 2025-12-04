import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TemplateContext {
  [key: string]: string | number | undefined;
}

interface TemplatePreviewData {
  form: any;
  questions: any[];
  sampleAnswers: any[];
  sampleResponse: any;
  context: TemplateContext;
  processTemplate: (template: string) => string;
}

export const useTemplatePreview = (formId: string) => {
  return useQuery<TemplatePreviewData>({
    queryKey: ['template-preview', formId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('preview-template', {
        body: { formId }
      });

      if (error) throw error;

      // Return data with a sync processTemplate function using the backend-generated context
      // This avoids extra API calls on every keystroke while still using backend as source of truth
      return {
        form: data.form,
        questions: data.questions,
        sampleAnswers: data.sampleAnswers,
        sampleResponse: data.sampleResponse,
        context: data.context,
        processTemplate: (template: string) => {
          // Simple regex replace using backend-generated context
          return template.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
            const trimmed = varName.trim();
            return data.context[trimmed] !== undefined 
              ? String(data.context[trimmed]) 
              : match;
          });
        }
      };
    },
  });
};
