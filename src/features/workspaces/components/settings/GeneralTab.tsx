import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, LogOut } from 'lucide-react';
import { InlineLoader } from '@/shared/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { SettingsCard } from '@/shared/ui/SettingsCard';
import { SettingsRow } from '@/shared/ui/SettingsRow';
import { useWorkspaceContext } from '../../context/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { workspacesApi } from '../../api/workspacesApi';
import { ROUTES } from '@/shared/constants/routes';

export const GeneralTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeWorkspace, userRole, refetch, workspaces, setActiveWorkspace } = useWorkspaceContext();
  
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const handleSaveName = async () => {
    if (!activeWorkspace || !name.trim()) return;
    
    const trimmedName = name.trim();
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      toast({
        title: 'Invalid name',
        description: 'Workspace name must be 3-50 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await workspacesApi.updateWorkspace(activeWorkspace.id, { name: trimmedName });
      await refetch();
      toast({
        title: 'Success',
        description: 'Workspace name updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update workspace',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;

    setIsDeleting(true);
    try {
      await workspacesApi.deleteWorkspace(activeWorkspace.id);
      await refetch();
      
      const remaining = workspaces.filter(w => w.id !== activeWorkspace.id);
      if (remaining.length > 0) {
        setActiveWorkspace(remaining[0]);
        navigate(ROUTES.FORMS_HOME);
      } else {
        navigate(ROUTES.ONBOARDING);
      }
      
      toast({
        title: 'Workspace deleted',
        description: 'The workspace and all its forms have been deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete workspace',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!activeWorkspace) return;

    setIsLeaving(true);
    try {
      await workspacesApi.leaveWorkspace(activeWorkspace.id);
      await refetch();
      
      const remaining = workspaces.filter(w => w.id !== activeWorkspace.id);
      if (remaining.length > 0) {
        setActiveWorkspace(remaining[0]);
        navigate(ROUTES.FORMS_HOME);
      } else {
        navigate(ROUTES.ONBOARDING);
      }
      
      toast({
        title: 'Left workspace',
        description: 'You have left the workspace',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to leave workspace',
        variant: 'destructive',
      });
    } finally {
      setIsLeaving(false);
    }
  };

  if (!activeWorkspace) return null;

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Workspace Name */}
      <SettingsCard
        title="Workspace Name"
        description="The display name for your workspace"
      >
        {isAdmin ? (
          <SettingsRow label="Name" fullWidth>
            <div className="flex gap-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                className="flex-1 input-focus-glow"
                disabled={isSaving}
              />
              <Button 
                onClick={handleSaveName} 
                disabled={isSaving || name.trim() === activeWorkspace.name}
              >
                {isSaving ? (
                  <InlineLoader size="sm" />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </SettingsRow>
        ) : (
          <SettingsRow label="Name">
            <p className="text-foreground font-medium">{activeWorkspace.name}</p>
          </SettingsRow>
        )}
      </SettingsCard>

      {/* Leave Workspace - For non-admin members */}
      {!isAdmin && (
        <SettingsCard
          title="Leave Workspace"
          description="Remove yourself from this workspace"
        >
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isLeaving}>
                  {isLeaving ? (
                    <>
                      <InlineLoader size="sm" className="mr-2" />
                      Leaving...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Leave Workspace
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave Workspace</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to leave "{activeWorkspace.name}"? You will lose access to all forms and data in this workspace.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeaveWorkspace}>
                    Leave Workspace
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SettingsCard>
      )}

      {/* Danger Zone */}
      {isAdmin && (
        <SettingsCard
          title="Danger Zone"
          description="Irreversible and destructive actions"
          variant="danger"
        >
          <div className="pt-2">
            <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) setConfirmName('');
            }}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <InlineLoader size="sm" className="mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Workspace
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div className="space-y-4">
                      <p>
                        This will permanently delete the workspace "<span className="font-medium text-foreground">{activeWorkspace.name}</span>" and all its forms, responses, and data. This action cannot be undone.
                      </p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          To confirm, type <span className="font-mono font-medium text-foreground">{activeWorkspace.name}</span> below:
                        </p>
                        <Input
                          value={confirmName}
                          onChange={(e) => setConfirmName(e.target.value)}
                          placeholder="Type workspace name to confirm"
                          className="input-focus-glow"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteWorkspace}
                    disabled={confirmName !== activeWorkspace.name}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Workspace
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SettingsCard>
      )}
    </div>
  );
};
