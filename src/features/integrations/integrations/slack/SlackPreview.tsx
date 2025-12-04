import { MessageSquare } from 'lucide-react';
import { IntegrationPreviewProps } from '../../types/integrationDefinition';

export const SlackPreview = ({ processedContent }: IntegrationPreviewProps) => (
  <div className="space-y-3">
    <div className="bg-background/50 border border-border/50 rounded-lg p-3">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="font-semibold text-sm">Forms Bot</div>
          <div className="text-sm whitespace-pre-wrap">
            {processedContent.body || '(no message)'}
          </div>
        </div>
      </div>
    </div>
  </div>
);
