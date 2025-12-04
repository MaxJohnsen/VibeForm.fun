/**
 * Generate email HTML matching the edge function's template for accurate preview.
 * This must stay in sync with the email handler in supabase/functions/_shared/integrations/handlers/email.ts
 */
export const generateEmailHtml = (bodyContent: string): string => {
  // Convert newlines to <br> if no block-level HTML present
  const htmlBody = /<(p|div|table|ul|ol|h[1-6])\b/i.test(bodyContent)
    ? bodyContent.replace(/\n/g, '<br>')
    : bodyContent.replace(/\n/g, '<br>');
    
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin:0; padding:0; background:#f5f5f5; font-family:sans-serif; }
    h1 { font-size:24px; font-weight:600; margin:0 0 16px 0; color:#111; }
    h2 { font-size:20px; font-weight:600; margin:0 0 12px 0; color:#111; }
    p { margin:0 0 12px 0; }
  </style>
</head>
<body>
  <table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table width="100%" style="max-width:100%; background:#fff; border:1px solid #e5e5e5; border-radius:4px;" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding:24px; font-size:14px; line-height:1.6; color:#333;">
              ${htmlBody}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
