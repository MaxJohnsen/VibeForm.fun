import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MessageSquare, Webhook, Zap } from 'lucide-react';
import { IntegrationType } from '../api/integrationsApi';

interface ActionPreviewProps {
  type: IntegrationType;
  config: Record<string, any>;
  processedContent: {
    subject?: string;
    body?: string;
    to?: string;
    cc?: string;
    bcc?: string;
    fromName?: string;
    fromEmail?: string;
    useCustomApiKey?: boolean;
    payload?: any;
  };
}

export const ActionPreview = ({ type, config, processedContent }: ActionPreviewProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === 'email' && <Mail className="h-4 w-4 text-muted-foreground" />}
          {type === 'slack' && <MessageSquare className="h-4 w-4 text-muted-foreground" />}
          {type === 'webhook' && <Webhook className="h-4 w-4 text-muted-foreground" />}
          {type === 'zapier' && <Zap className="h-4 w-4 text-muted-foreground" />}
          <h3 className="font-semibold text-sm">Preview</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          Using sample data
        </Badge>
      </div>

      <ScrollArea className="max-h-[70vh] lg:max-h-[calc(100vh-200px)] rounded-lg border border-border/50 bg-muted/30 backdrop-blur-sm transition-all duration-200">
        <div className="p-4">
          {type === 'email' && (
            <EmailPreview
              to={processedContent.to}
              cc={processedContent.cc}
              bcc={processedContent.bcc}
              subject={processedContent.subject}
              body={processedContent.body}
              fromName={processedContent.fromName}
              fromEmail={processedContent.fromEmail}
              useCustomApiKey={processedContent.useCustomApiKey}
            />
          )}

          {type === 'slack' && (
            <SlackPreview
              message={processedContent.body}
            />
          )}

          {(type === 'webhook' || type === 'zapier') && (
            <WebhookPreview
              url={config.url || config.webhookUrl}
              method={config.method || 'POST'}
              payload={processedContent.payload}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// Generate email HTML matching the handler's template for accurate preview
function generateEmailHtml(bodyContent: string): string {
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
}

const EmailPreview = ({ to, cc, bcc, subject, body, fromName, fromEmail, useCustomApiKey }: any) => {
  const fromDisplay = useCustomApiKey && fromEmail
    ? `${fromName || 'Forms'} <${fromEmail}>`
    : 'Fairform <action@fairform.io>';
  
  const emailHtml = generateEmailHtml(body || '(no content)');
  
  return (
    <div className="space-y-3 text-xs">
      <div className="space-y-1 font-mono">
        <div className="text-muted-foreground">From: {fromDisplay}</div>
        <div className="text-muted-foreground">To: {to || '(not set)'}</div>
        {cc && <div className="text-muted-foreground">CC: {cc}</div>}
        {bcc && <div className="text-muted-foreground">BCC: {bcc}</div>}
        <div className="font-semibold">Subject: {subject || '(not set)'}</div>
      </div>
      <div className="border-t border-border/50 pt-3">
        <iframe
          srcDoc={emailHtml}
          className="w-full rounded border-0"
          style={{ minHeight: '450px', background: '#f5f5f5' }}
          title="Email preview"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
};

const SlackPreview = ({ message }: any) => (
  <div className="space-y-3">
    <div className="bg-background/50 border border-border/50 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="font-semibold text-sm">Forms Bot</div>
          <div className="text-sm whitespace-pre-wrap">
            {message || '(no message)'}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const WebhookPreview = ({ url, method, payload }: any) => (
  <div className="space-y-3 font-mono text-xs">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          {method}
        </Badge>
        <span className="text-muted-foreground">{url || '(not set)'}</span>
      </div>
    </div>
    <div className="border-t border-border/50 pt-3">
      <div className="text-muted-foreground mb-1">Payload:</div>
      <pre className="bg-background/50 border border-border/50 rounded p-3 overflow-x-auto">
        <code>{payload ? JSON.stringify(payload, null, 2) : '(no payload)'}</code>
      </pre>
    </div>
  </div>
);
