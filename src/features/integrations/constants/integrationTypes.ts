import { Mail, MessageSquare, Webhook, Zap } from 'lucide-react';
import { IntegrationType } from '../api/integrationsApi';

export interface SecretFieldConfig {
  key: string; // Key type for integration_secrets table
  configPath?: string; // Path in config object (if secret replaces config field)
  label: string;
  placeholder: string;
  helpUrl?: string;
}

export interface IntegrationTypeInfo {
  type: IntegrationType;
  label: string;
  description: string;
  icon: typeof Mail;
  color: string;
  secretField?: SecretFieldConfig;
}

export const INTEGRATION_TYPES: IntegrationTypeInfo[] = [
  {
    type: 'email',
    label: 'Email',
    description: 'Send automated email notifications when responses are submitted',
    icon: Mail,
    color: 'text-blue-500',
    secretField: {
      key: 'resend_api_key',
      label: 'Resend API Key',
      placeholder: 're_xxxxxxxxxxxxx',
      helpUrl: 'https://resend.com/api-keys',
    },
  },
  {
    type: 'slack',
    label: 'Slack',
    description: 'Post messages to Slack channels in real-time',
    icon: MessageSquare,
    color: 'text-purple-500',
    secretField: {
      key: 'slack_webhook',
      configPath: 'webhookUrl',
      label: 'Slack Webhook URL',
      placeholder: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
      helpUrl: 'https://api.slack.com/messaging/webhooks',
    },
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Trigger custom HTTP requests to any endpoint',
    icon: Webhook,
    color: 'text-green-500',
    // No secretField - webhooks store URL in plain config
  },
  {
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
  },
];

export const getIntegrationTypeInfo = (type: IntegrationType): IntegrationTypeInfo => {
  return INTEGRATION_TYPES.find((t) => t.type === type) || INTEGRATION_TYPES[0];
};
