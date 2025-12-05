import { MessageSquare } from 'lucide-react';
import { IntegrationDefinition, ValidationContext, PreviewBuildContext } from '../../types/integrationDefinition';
import { SlackConfig } from './SlackConfig';
import { SlackPreview } from './SlackPreview';

export const slackDefinition: IntegrationDefinition = {
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
  
  ConfigComponent: SlackConfig,
  PreviewComponent: SlackPreview,
  
  getDefaultConfig: () => ({
    webhookUrl: '',
    message: `📋 *New Response: {{form_title}}*

{{all_answers_markdown}}

_Submitted at {{submitted_at}}_`,
  }),
  
  validateConfig: (_config: Record<string, any>, context: ValidationContext): boolean => {
    return context.hasExistingSecret || !!context.pendingSecret;
  },
  
  buildProcessedContent: (config, ctx: PreviewBuildContext) => ({
    body: config.message
      ? ctx.processTemplate(config.message)
      : `New response for ${ctx.form.title}\n\n${String(ctx.context.all_answers)}`,
  }),
};
