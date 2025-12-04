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

// Wrap content in a minimal HTML email container - simplified for better deliverability
function wrapInHtmlEmail(bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family:sans-serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" style="max-width:600px; background:#fff; border:1px solid #e5e5e5; border-radius:4px;" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding:24px; font-size:14px; line-height:1.6; color:#333;">
              ${bodyContent}
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
  const fullHtml = wrapInHtmlEmail(htmlBody);

  // Generate unique ID for this email
  const entityRefId = String(templateContext.response_id || crypto.randomUUID());

  // Send email via Resend with headers for better deliverability
  const emailPayload = {
    from: fromEmail,
    to: toEmails,
    cc: ccEmails.length > 0 ? ccEmails : undefined,
    bcc: bccEmails.length > 0 ? bccEmails : undefined,
    subject,
    html: fullHtml,
    text: body, // Plain text fallback improves deliverability
    reply_to: toEmails[0], // Reply goes to first recipient
    headers: {
      'List-Unsubscribe': `<mailto:unsubscribe@fairform.io?subject=Unsubscribe%20${integration.id}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'X-Entity-Ref-ID': entityRefId,
    },
  };

  console.log('Sending email to:', toEmails, 'from:', fromEmail, 'entity-ref:', entityRefId);

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
