import { useState } from 'react';
import { MoreVertical, Power, Trash2, TestTube, Clock } from 'lucide-react';
import { Integration } from '../api/integrationsApi';
import { getIntegrationTypeInfo } from '../constants/integrationTypes';
import { useIntegrations } from '../hooks/useIntegrations';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { IntegrationLogsDialog } from './IntegrationLogsDialog';

interface IntegrationCardProps {
  integration: Integration;
}

export const IntegrationCard = ({ integration }: IntegrationCardProps) => {
  const typeInfo = getIntegrationTypeInfo(integration.type);
  const Icon = typeInfo.icon;
  const { updateIntegration, deleteIntegration, testIntegration, isTesting } = useIntegrations(
    integration.form_id
  );
  const [showLogs, setShowLogs] = useState(false);

  const handleToggle = () => {
    updateIntegration({
      id: integration.id,
      updates: { enabled: !integration.enabled },
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this integration?')) {
      deleteIntegration(integration.id);
    }
  };

  const handleTest = () => {
    testIntegration(integration.id);
  };

  return (
    <>
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-lg bg-muted/50 ${typeInfo.color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{integration.name}</h3>
                <Badge variant={integration.enabled ? 'default' : 'secondary'}>
                  {integration.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{typeInfo.label}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Triggers on: {integration.trigger.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggle}>
                <Power className="h-4 w-4 mr-2" />
                {integration.enabled ? 'Disable' : 'Enable'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTest} disabled={isTesting}>
                <TestTube className="h-4 w-4 mr-2" />
                Test
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLogs(true)}>
                <Clock className="h-4 w-4 mr-2" />
                View Logs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <IntegrationLogsDialog
        integrationId={integration.id}
        integrationName={integration.name}
        open={showLogs}
        onOpenChange={setShowLogs}
      />
    </>
  );
};
