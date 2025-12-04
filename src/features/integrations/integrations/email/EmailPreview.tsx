import { IntegrationPreviewProps } from '../../types/integrationDefinition';
import { generateEmailHtml } from '../../utils/emailHtml';

export const EmailPreview = ({ processedContent }: IntegrationPreviewProps) => {
  const fromDisplay = processedContent.useCustomApiKey && processedContent.fromEmail
    ? `${processedContent.fromName || 'Forms'} <${processedContent.fromEmail}>`
    : 'Fairform <action@fairform.io>';
  
  const emailHtml = generateEmailHtml(processedContent.body || '(no content)');
  
  return (
    <div className="space-y-3 text-xs">
      <div className="space-y-1 font-mono">
        <div className="text-muted-foreground">From: {fromDisplay}</div>
        <div className="text-muted-foreground">To: {processedContent.to || '(not set)'}</div>
        {processedContent.cc && <div className="text-muted-foreground">CC: {processedContent.cc}</div>}
        {processedContent.bcc && <div className="text-muted-foreground">BCC: {processedContent.bcc}</div>}
        <div className="font-semibold">Subject: {processedContent.subject || '(not set)'}</div>
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
