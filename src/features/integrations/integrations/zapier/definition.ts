import { Zap } from 'lucide-react';
import { IntegrationDefinition, ValidationContext, PreviewBuildContext } from '../../types/integrationDefinition';
import { ZapierConfig } from './ZapierConfig';
import { WebhookPreview } from '../webhook/WebhookPreview';
import { buildWebhookPayload } from '../webhook/definition';

export const zapierDefinition: IntegrationDefinition = {
  type: 'zapier',
  label: 'Zapier',
  description: 'Connect to 5,000+ apps through Zapier workflows',
  icon: Zap,
  color: 'text-orange-500',
  secretField: {
    key: 'zapier_webhook',
    configPath: 'webhookUrl',
    label: 'Zapier Webhook URL',
    placeholder: 'https://hooks.zapier.com/hooks/catch/...',
    helpUrl: 'https://zapier.com/apps/webhook/integrations',
  },
  
  ConfigComponent: ZapierConfig,
  PreviewComponent: WebhookPreview, // Reuse webhook preview
  
  getDefaultConfig: () => ({
    webhookUrl: '',
  }),
  
  validateConfig: (_config: Record<string, any>, context: ValidationContext): boolean => {
    return context.hasExistingSecret || !!context.pendingSecret;
  },
  
  buildProcessedContent: (_config, ctx: PreviewBuildContext) => ({
    payload: buildWebhookPayload(ctx),
  }),
};
