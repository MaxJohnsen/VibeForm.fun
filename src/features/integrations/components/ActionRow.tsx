import { useState } from 'react';
import { MoreVertical, Play, Trash2, History, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/shared/ui/GlassCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Integration } from '../api/integrationsApi';
import { useIntegrations } from '../hooks/useIntegrations';
import { IntegrationLogsDialog } from './IntegrationLogsDialog';
import { getIntegration } from '../integrations';

interface ActionRowProps {
  action: Integration;
  onEdit: () => void;
  onUpdate: (id: string, updates: Partial<Integration>) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

export const ActionRow = ({ action, onEdit, onUpdate, onDelete, isUpdating }: ActionRowProps) => {
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const { testIntegration, isTesting } = useIntegrations(action.form_id);
  
  const integration = getIntegration(action.type);
  const Icon = integration.icon;

  const handleTest = async () => {
    await testIntegration(action.id);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this action?')) {
      onDelete(action.id);
    }
  };

  const handleToggle = () => {
    onUpdate(action.id, { enabled: !action.enabled });
  };

  return (
    <>
      <GlassCard className="p-4 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg bg-primary/10 ${integration.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{action.name}</h3>
                <Badge 
                  variant={action.enabled ? 'default' : 'secondary'}
                  className="shrink-0"
                >
                  {action.enabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{integration.label}</span>
                <span>•</span>
                <span className="capitalize">{action.trigger.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              disabled={isUpdating}
            >
              {action.enabled ? 'Disable' : 'Enable'}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onEdit}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsLogsDialogOpen(true)}
                  className="gap-2"
                >
                  <History className="h-4 w-4" />
                  View Logs
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleTest}
                  disabled={isTesting}
                  className="gap-2"
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Test Action
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </GlassCard>

      <IntegrationLogsDialog
        integrationId={action.id}
        integrationName={action.name}
        open={isLogsDialogOpen}
        onOpenChange={setIsLogsDialogOpen}
      />
    </>
  );
};
