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

interface ActionRowProps {
  action: Integration;
}

export const ActionRow = ({ action }: ActionRowProps) => {
  const typeInfo = getIntegrationTypeInfo(action.type);
  const Icon = typeInfo.icon;
  const { updateIntegration, deleteIntegration, testIntegration, isTesting } = useIntegrations(
    action.form_id
  );
  const [showLogs, setShowLogs] = useState(false);

  const handleToggle = () => {
    updateIntegration({
      id: action.id,
      updates: { enabled: !action.enabled },
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this action?')) {
      deleteIntegration(action.id);
    }
  };

  const handleTest = () => {
    testIntegration(action.id);
  };

  const triggerLabel = action.trigger
    .replace('form_', '')
    .replace('_', ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <>
      <div className="glass-panel p-4 rounded-lg hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div className={`p-2 rounded-lg bg-muted/50 shrink-0 ${typeInfo.color}`}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Name & Type */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{action.name}</h3>
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={`w-2 h-2 rounded-full ${action.enabled ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                <span className="text-xs text-muted-foreground">
                  {action.enabled ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant="secondary" className="font-normal">
                {typeInfo.label}
              </Badge>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Triggers on {triggerLabel}</span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggle}>
                <Power className="h-4 w-4 mr-2" />
                {action.enabled ? 'Disable' : 'Enable'}
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
        integrationId={action.id}
        integrationName={action.name}
        open={showLogs}
        onOpenChange={setShowLogs}
      />
    </>
  );
};
