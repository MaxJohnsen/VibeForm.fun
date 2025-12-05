import { toHTML } from 'slack-markdown';
import { MessageSquare } from 'lucide-react';
import { IntegrationPreviewProps } from '../../types/integrationDefinition';

export const SlackPreview = ({ processedContent }: IntegrationPreviewProps) => {
  const htmlContent = processedContent.body 
    ? toHTML(processedContent.body, { hrefTarget: '_blank' })
    : '<span class="text-muted-foreground">(no message)</span>';

  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
        <MessageSquare className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-foreground">Forms Bot</span>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div 
          className="mt-1 text-sm slack-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};
