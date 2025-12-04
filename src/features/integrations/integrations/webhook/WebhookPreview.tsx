import { Badge } from '@/components/ui/badge';
import { IntegrationPreviewProps } from '../../types/integrationDefinition';

interface WebhookPreviewProps extends IntegrationPreviewProps {
  url?: string;
  method?: string;
}

export const WebhookPreview = ({ config, processedContent }: WebhookPreviewProps) => (
  <div className="space-y-3 font-mono text-xs">
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono">
          {config.method || 'POST'}
        </Badge>
        <span className="text-muted-foreground">{config.url || config.webhookUrl || '(not set)'}</span>
      </div>
    </div>
    <div className="border-t border-border/50 pt-3">
      <div className="text-muted-foreground mb-1">Payload:</div>
      <pre className="bg-background/50 border border-border/50 rounded p-3 overflow-x-auto">
        <code>{processedContent.payload ? JSON.stringify(processedContent.payload, null, 2) : '(no payload)'}</code>
      </pre>
    </div>
  </div>
);
