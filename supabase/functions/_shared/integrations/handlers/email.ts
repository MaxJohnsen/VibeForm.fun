import type { IntegrationHandler, HandlerResult } from '../types.ts';
import { buildTemplateContext, processTemplate } from '../../templateEngine.ts';
import { fetchAndDecryptSecret, formatAnswerValue } from '../utils.ts';

export const emailHandler: IntegrationHandler = async (ctx): Promise<HandlerResult> => {
  const { integration, response, questions, supabase } = ctx;
  const config = integration.config;

  console.log('Processing email integration:', integration.name);

  // Build template context
  const form = response.forms;
  const answers = response.answers || [];
  const context = buildTemplateContext(form, response, questions, answers);

  // Process subject and body templates
  const subject = processTemplate(config.subject || '{{form_title}} - New Response', context);
  const body = processTemplate(
    config.body || 'New response received for {{form_title}}:\n\n{{answers_text}}',
    context
  );

  // Parse email addresses
  const toEmails = config.to?.split(',').map((e: string) => e.trim()).filter(Boolean) || [];
  const ccEmails = config.cc?.split(',').map((e: string) => e.trim()).filter(Boolean) || [];
  const bccEmails = config.bcc?.split(',').map((e: string) => e.trim()).filter(Boolean) || [];

  if (toEmails.length === 0) {
    throw new Error('No recipient email addresses configured');
  }

  // Get API key (custom or default)
  let apiKey: string;
  if (config.useCustomApiKey) {
    apiKey = await fetchAndDecryptSecret(supabase, integration.id, 'resend_api_key');
  } else {
    apiKey = Deno.env.get('RESEND_API_KEY') || '';
    if (!apiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
  }

  // Send email via Resend
  const emailPayload = {
    from: config.from || 'noreply@resend.dev',
    to: toEmails,
    cc: ccEmails.length > 0 ? ccEmails : undefined,
    bcc: bccEmails.length > 0 ? bccEmails : undefined,
    subject,
    text: body,
  };

  console.log('Sending email to:', toEmails);

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
    throw new Error(`Resend API error: ${errorData}`);
  }

  const emailResult = await emailResponse.json();
  console.log('Email sent successfully:', emailResult.id);

  return {
    success: true,
    data: emailResult,
  };
};
