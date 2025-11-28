import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIntegrationLogs } from '../hooks/useIntegrations';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IntegrationLogsDialogProps {
  integrationId: string;
  integrationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const IntegrationLogsDialog = ({
  integrationId,
  integrationName,
  open,
  onOpenChange,
}: IntegrationLogsDialogProps) => {
  const { data: logs, isLoading } = useIntegrationLogs(integrationId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Execution Logs: {integrationName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No execution logs yet. Logs will appear after the integration runs.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="glass-panel p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : log.status === 'error' ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.executed_at).toLocaleString()}
                    </span>
                  </div>

                  {log.error_message && (
                    <div className="mt-2 p-2 rounded bg-destructive/10 text-sm text-destructive">
                      {log.error_message}
                    </div>
                  )}

                  {log.response_data && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View response data
                      </summary>
                      <pre className="mt-2 p-2 rounded bg-muted/50 overflow-x-auto">
                        {JSON.stringify(log.response_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
