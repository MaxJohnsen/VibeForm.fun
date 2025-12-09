import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspaceContext } from '../context/WorkspaceContext';
import { useState } from 'react';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export const WorkspaceSwitcher = ({ collapsed = false }: WorkspaceSwitcherProps) => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceContext();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (!activeWorkspace) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'justify-start gap-2 hover:bg-accent/50 transition-all',
              collapsed ? 'w-10 h-10 p-0' : 'w-full px-3'
            )}
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left text-sm font-medium">
                  {activeWorkspace.name}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56"
          side={collapsed ? 'right' : 'bottom'}
        >
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Workspaces
          </div>
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => setActiveWorkspace(workspace)}
              className="cursor-pointer"
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mr-2">
                <Building2 className="h-3 w-3" />
              </div>
              <span className="truncate flex-1">{workspace.name}</span>
              {workspace.id === activeWorkspace.id && (
                <Check className="h-4 w-4 text-primary ml-2" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setCreateDialogOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </>
  );
};
