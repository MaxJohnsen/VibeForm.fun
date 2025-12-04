import type { IntegrationHandler, HandlerResult } from '../types.ts';
import { processTemplate } from '../../templateEngine.ts';
import { fetchAndDecryptSecret } from '../utils.ts';

export const emailHandler: IntegrationHandler = async (ctx): Promise<HandlerResult> => {
  const { integration, templateContext, supabase } = ctx;
  const config = integration.config;

  console.log('Processing email integration:', integration.name);

  // Process subject and body templates using pre-built context
  const subject = processTemplate(
    config.subject || '{{form_title}} - New Response', 
    templateContext
  );
  
  // Default template uses all_answers (matching the template engine output)
  const defaultBodyTemplate = `New response received for {{form_title}}

{{all_answers}}

---
Submitted at: {{submitted_at}}
Response ID: {{response_id}}`;

  // Support both field naming conventions: bodyTemplate (frontend), body (legacy)
  const body = processTemplate(
    config.bodyTemplate || config.body || defaultBodyTemplate,
    templateContext
  );

  // Parse email addresses - support both 'to' (canonical) and 'recipient' (legacy)
  const recipientField = config.to || config.recipient || '';
  const toEmails = recipientField.split(',').map((e: string) => e.trim()).filter(Boolean);
  const ccEmails = config.cc?.split(',').map((e: string) => e.trim()).filter(Boolean) || [];
  const bccEmails = config.bcc?.split(',').map((e: string) => e.trim()).filter(Boolean) || [];

  if (toEmails.length === 0) {
    throw new Error('No recipient email addresses configured');
  }

  // Get API key (custom or default)
  let apiKey: string;
  let fromEmail: string;
  
  if (config.useCustomApiKey) {
    apiKey = await fetchAndDecryptSecret(supabase, integration.id, 'resend_api_key');
    // When using custom API key, allow custom from address
    const fromName = config.fromName || 'Forms';
    fromEmail = config.fromEmail 
      ? `${fromName} <${config.fromEmail}>`
      : 'Forms <noreply@resend.dev>';
  } else {
    apiKey = Deno.env.get('RESEND_API_KEY') || '';
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    // Default sender for Fairform's Resend account
    fromEmail = 'Fairform <action@fairform.io>';
  }

  // Send email via Resend
  const emailPayload = {
    from: fromEmail,
    to: toEmails,
    cc: ccEmails.length > 0 ? ccEmails : undefined,
    bcc: bccEmails.length > 0 ? bccEmails : undefined,
    subject,
    text: body,
  };

  console.log('Sending email to:', toEmails, 'from:', fromEmail);

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(emailPayload),
  });

  if (!emailResponse.ok) {
    const errorData = await emailResponse.text();
    console.error('Resend API error:', errorData);
    throw new Error(`Resend API error: ${errorData}`);
  }

  const emailResult = await emailResponse.json();
  console.log('Email sent successfully:', emailResult.id);

  return {
    success: true,
    data: emailResult,
  };
};
