import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CreateWorkspaceForm } from './CreateWorkspaceForm';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useWorkspaceContext } from '../context/WorkspaceContext';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateWorkspaceDialog = ({ open, onOpenChange }: CreateWorkspaceDialogProps) => {
  const { createWorkspace, isCreating } = useWorkspaces();
  const { refetch } = useWorkspaceContext();

  const handleCreate = async (name: string) => {
    await createWorkspace({ name });
    await refetch();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your forms and collaborate with your team.
          </DialogDescription>
        </DialogHeader>
        <CreateWorkspaceForm 
          onSubmit={handleCreate} 
          isLoading={isCreating}
        />
      </DialogContent>
    </Dialog>
  );
};
