import type { IntegrationHandler, HandlerResult } from '../types.ts';
import { processTemplate } from '../../templateEngine.ts';
import { fetchAndDecryptSecret } from '../utils.ts';

// Convert plain text to HTML-safe content
function prepareHtmlBody(body: string): string {
  // If body already contains HTML block elements, use as-is
  if (/<(p|div|table|ul|ol|h[1-6])\b/i.test(body)) {
    return body;
  }
  
  // Otherwise, escape HTML entities and convert newlines to <br>
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  return escaped.replace(/\n/g, '<br>');
}

// Wrap content in a beautiful, minimal HTML email template
function wrapInHtmlEmail(formTitle: string, bodyContent: string, submittedAt: string, responseId: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" style="max-width: 600px; background: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #eaeaea;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 600; color: #111111;">${formTitle}</h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #666666;">New form response received</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; font-size: 14px; line-height: 1.6; color: #333333;">
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td style="padding: 16px 32px 24px; border-top: 1px solid #eaeaea; font-size: 12px; color: #888888;">
              Submitted ${submittedAt} · Response ID: ${responseId}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const emailHandler: IntegrationHandler = async (ctx): Promise<HandlerResult> => {
  const { integration, templateContext, supabase } = ctx;
  const config = integration.config;

  console.log('Processing email integration:', integration.name);

  // Process subject template
  const subject = processTemplate(
    config.subject || '{{form_title}} - New Response', 
    templateContext
  );
  
  // Default template uses all_answers
  const defaultBodyTemplate = `{{all_answers}}`;

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

  // Prepare HTML body and wrap in email template
  const htmlBody = prepareHtmlBody(body);
  const fullHtml = wrapInHtmlEmail(
    String(templateContext.form_title || 'Form Response'),
    htmlBody,
    String(templateContext.submitted_at || new Date().toISOString()),
    String(templateContext.response_id || '')
  );

  // Send email via Resend
  const emailPayload = {
    from: fromEmail,
    to: toEmails,
    cc: ccEmails.length > 0 ? ccEmails : undefined,
    bcc: bccEmails.length > 0 ? bccEmails : undefined,
    subject,
    html: fullHtml,
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
