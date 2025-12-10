import { useState } from 'react';
import { Trash2, History, Settings, Play } from 'lucide-react';
import { InlineLoader } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { GlassCard } from '@/shared/ui/GlassCard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Integration } from '../api/integrationsApi';
import { IntegrationLogsDialog } from './IntegrationLogsDialog';
import { getIntegration } from '../integrations';
import { cn } from '@/lib/utils';

interface ActionCardProps {
  action: Integration;
  onEdit: () => void;
  onUpdate: (id: string, updates: Partial<Integration>) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => Promise<void>;
  isUpdating: boolean;
  isTesting?: boolean;
}

export const ActionCard = ({ 
  action, 
  onEdit, 
  onUpdate, 
  onDelete, 
  onTest,
  isUpdating,
  isTesting = false,
}: ActionCardProps) => {
  const [isLogsDialogOpen, setIsLogsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLocalTesting, setIsLocalTesting] = useState(false);
  
  const integration = getIntegration(action.type);
  const Icon = integration.icon;

  const handleDelete = () => {
    onDelete(action.id);
    setIsDeleteDialogOpen(false);
  };

  const handleToggle = (checked: boolean) => {
    onUpdate(action.id, { enabled: checked });
  };

  const handleTest = async () => {
    setIsLocalTesting(true);
    try {
      await onTest(action.id);
    } finally {
      setIsLocalTesting(false);
    }
  };

  const showTestLoading = isLocalTesting || isTesting;

  return (
    <>
      <GlassCard 
        className={cn(
          "p-4 transition-all duration-200 hover:shadow-lg group",
          !action.enabled && "opacity-70"
        )}
      >
        {/* Header: Status */}
        <div className="flex items-center gap-2 mb-3">
          <span 
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              action.enabled ? "bg-green-500" : "bg-muted-foreground/40"
            )} 
          />
          <span 
            className={cn(
              "text-xs font-medium",
              action.enabled ? "text-green-600" : "text-muted-foreground"
            )}
          >
            {action.enabled ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div 
            className={cn(
              "p-3 rounded-2xl bg-primary/10 border border-primary/10",
              integration.color
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="text-center mb-3">
          <h3 className="font-semibold text-foreground truncate mb-1" title={action.name}>
            {action.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {integration.label} • <span className="capitalize">{action.trigger.replace('_', ' ')}</span>
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onEdit}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleTest}
                      disabled={showTestLoading}
                    >
                      {showTestLoading ? (
                        <InlineLoader size="sm" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Test</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsLogsDialogOpen(true)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Logs</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {action.enabled ? 'On' : 'Off'}
            </span>
            <Switch
              checked={action.enabled}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
            />
          </div>
        </div>
      </GlassCard>

      <IntegrationLogsDialog
        integrationId={action.id}
        integrationName={action.name}
        open={isLogsDialogOpen}
        onOpenChange={setIsLogsDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{action.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
