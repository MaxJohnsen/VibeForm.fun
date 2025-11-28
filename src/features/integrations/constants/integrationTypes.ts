import { Mail, MessageSquare, Webhook, Zap } from 'lucide-react';
import { IntegrationType } from '../api/integrationsApi';

export interface IntegrationTypeInfo {
  type: IntegrationType;
  label: string;
  description: string;
  icon: typeof Mail;
  color: string;
}

export const INTEGRATION_TYPES: IntegrationTypeInfo[] = [
  {
    type: 'email',
    label: 'Email',
    description: 'Send email notifications via Resend when forms are completed',
    icon: Mail,
    color: 'text-blue-500',
  },
  {
    type: 'slack',
    label: 'Slack',
    description: 'Post messages to Slack channels via webhook',
    icon: MessageSquare,
    color: 'text-purple-500',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Send custom HTTP requests to any URL',
    icon: Webhook,
    color: 'text-green-500',
  },
  {
    type: 'zapier',
    label: 'Zapier',
    description: 'Trigger Zapier workflows with form responses',
    icon: Zap,
    color: 'text-orange-500',
  },
];

export const getIntegrationTypeInfo = (type: IntegrationType): IntegrationTypeInfo => {
  return INTEGRATION_TYPES.find((t) => t.type === type) || INTEGRATION_TYPES[0];
};
