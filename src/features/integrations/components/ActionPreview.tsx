import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IntegrationType } from '../api/integrationsApi';
import { getIntegration } from '../integrations';

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
  const integration = getIntegration(type);
  const Icon = integration.icon;
  const PreviewComponent = integration.PreviewComponent;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-sm">Preview</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          Using sample data
        </Badge>
      </div>

      <ScrollArea className="max-h-[70vh] lg:max-h-[calc(100vh-200px)] rounded-lg border border-border/50 bg-muted/30 backdrop-blur-sm transition-all duration-200">
        <div className="p-4">
          <PreviewComponent
            config={config}
            processedContent={processedContent}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
