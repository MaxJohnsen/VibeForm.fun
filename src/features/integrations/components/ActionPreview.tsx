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
    recipient?: string;
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

      <ScrollArea className="h-[400px] rounded-lg border border-border/50 bg-muted/30 backdrop-blur-sm">
        <div className="p-4">
          {type === 'email' && (
            <EmailPreview
              recipient={processedContent.recipient || config.recipient}
              subject={processedContent.subject}
              body={processedContent.body}
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

// Helper to convert newlines to HTML line breaks
function convertToHtml(text: string): string {
  // Always convert newlines to <br> tags, regardless of existing HTML
  return text.replace(/\n/g, '<br>');
}

const EmailPreview = ({ recipient, subject, body }: any) => (
  <div className="space-y-3 text-xs">
    <div className="space-y-1 font-mono">
      <div className="text-muted-foreground">From: Forms &lt;noreply@forms.app&gt;</div>
      <div className="text-muted-foreground">To: {recipient || '(not set)'}</div>
      <div className="font-semibold">Subject: {subject || '(not set)'}</div>
    </div>
    <div className="border-t border-border/50 pt-3">
      <div 
        className="prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
        dangerouslySetInnerHTML={{ 
          __html: convertToHtml(body || '(no content)') 
        }}
      />
    </div>
  </div>
);

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
