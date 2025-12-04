import { Webhook } from 'lucide-react';
import { IntegrationDefinition } from '../../types/integrationDefinition';
import { WebhookConfig } from './WebhookConfig';
import { WebhookPreview } from './WebhookPreview';

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
};
