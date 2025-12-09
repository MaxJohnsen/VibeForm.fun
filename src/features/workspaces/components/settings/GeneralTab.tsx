import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Trash2, LogOut } from 'lucide-react';
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
                  <Loader2 className="h-4 w-4 animate-spin" />
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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
                  <AlertDialogDescription>
                    This will permanently delete the workspace "{activeWorkspace.name}" and all its forms, responses, and data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteWorkspace}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
