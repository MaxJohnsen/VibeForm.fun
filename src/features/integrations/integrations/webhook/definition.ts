import { Webhook } from 'lucide-react';
import { IntegrationDefinition, PreviewBuildContext } from '../../types/integrationDefinition';
import { WebhookConfig } from './WebhookConfig';
import { WebhookPreview } from './WebhookPreview';

const buildWebhookPayload = (ctx: PreviewBuildContext) => ({
  form_id: ctx.formId,
  form_title: ctx.form.title,
  form_slug: ctx.form.slug || '',
  response_id: 'sample-response-id',
  completed_at: new Date().toISOString(),
  answers: ctx.sampleAnswers.map((a) => {
    const question = ctx.questions.find((q) => q.id === a.question_id);
    return {
      question_id: a.question_id,
      question_label: question?.label || 'Unknown',
      question_type: question?.type || 'unknown',
      answer: a.answer_value,
    };
  }),
  metadata: {
    submitted_at: String(ctx.context.submitted_at),
    response_number: String(ctx.context.response_number),
  },
});

export const webhookDefinition: IntegrationDefinition = {
  type: 'webhook',
  label: 'Webhook',
  description: 'Trigger custom HTTP requests to any endpoint',
  icon: Webhook,
  color: 'text-green-500',
  // No secretField - webhooks store URL in plain config
  
  ConfigComponent: WebhookConfig,
  PreviewComponent: WebhookPreview,
  
  getDefaultConfig: () => ({
    url: '',
    method: 'POST',
    headers: '{"Content-Type": "application/json"}',
  }),
  
  validateConfig: (config: Record<string, any>): boolean => {
    return !!config.url;
  },
  
  buildProcessedContent: (_config, ctx: PreviewBuildContext) => ({
    payload: buildWebhookPayload(ctx),
  }),
};

// Export for reuse by Zapier
export { buildWebhookPayload };
