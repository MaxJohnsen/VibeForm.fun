import { Mail } from 'lucide-react';
import { IntegrationDefinition, ValidationContext, PreviewBuildContext } from '../../types/integrationDefinition';
import { EmailConfig } from './EmailConfig';
import { EmailPreview } from './EmailPreview';

export const emailDefinition: IntegrationDefinition = {
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
  
  ConfigComponent: EmailConfig,
  PreviewComponent: EmailPreview,
  
  getDefaultConfig: () => ({
    useCustomApiKey: false,
    to: '',
    cc: '',
    bcc: '',
    subject: 'New response: {{form_title}}',
    bodyTemplate: `<h1>{{form_title}}</h1>

We received a new form response!

{{all_answers_html}}

—

<p>Submitted at: {{submitted_at}}</p>
<p>Response ID: {{response_id}}</p>`,
  }),
  
  validateConfig: (config: Record<string, any>, context: ValidationContext): boolean => {
    const hasRecipient = !!(config.to || config.recipient);
    const hasSubject = !!config.subject;
    const hasCustomKeyIfNeeded = config.useCustomApiKey 
      ? (context.apiKeySaved || !!context.customApiKey || !!context.pendingSecret) 
      : true;
    return hasRecipient && hasSubject && hasCustomKeyIfNeeded;
  },
  
  buildProcessedContent: (config, ctx: PreviewBuildContext) => ({
    subject: config.subject ? ctx.processTemplate(config.subject) : undefined,
    body: config.bodyTemplate 
      ? ctx.processTemplate(config.bodyTemplate)
      : String(ctx.context.all_answers),
    to: config.to || config.recipient,
    cc: config.cc,
    bcc: config.bcc,
    fromName: config.fromName,
    fromEmail: config.fromEmail,
    useCustomApiKey: config.useCustomApiKey,
  }),
};
