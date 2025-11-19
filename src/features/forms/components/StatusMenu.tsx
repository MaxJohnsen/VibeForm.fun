import { useState } from 'react';
import { CheckCircle, FileEdit, Archive, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface StatusMenuProps {
  formId: string;
  currentStatus: 'draft' | 'active' | 'archived';
  questionCount?: number;
  onStatusChange: (newStatus: 'draft' | 'active' | 'archived') => Promise<void>;
  children?: React.ReactNode;
}

export const StatusMenu = ({ 
  currentStatus, 
  questionCount = 0,
  onStatusChange,
  children 
}: StatusMenuProps) => {
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'draft':
        return <FileEdit className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleStatusClick = (status: 'draft' | 'active' | 'archived') => {
    if (status === currentStatus) return;

    if (status === 'active') {
      if (questionCount === 0) {
        return; // Button should be disabled, but just in case
      }
      setShowActivateDialog(true);
    } else if (status === 'archived') {
      setShowArchiveDialog(true);
    } else {
      onStatusChange(status);
    }
  };

  const handleActivateConfirm = () => {
    onStatusChange('active');
    setShowActivateDialog(false);
  };

  const handleArchiveConfirm = () => {
    onStatusChange('archived');
    setShowArchiveDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              {getStatusIcon(currentStatus)}
              <span className="ml-2 capitalize">{currentStatus}</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleStatusClick('draft')}
            disabled={currentStatus === 'draft'}
          >
            <FileEdit className="h-4 w-4 mr-2" />
            <span>Set as Draft</span>
            {currentStatus === 'draft' && <CheckCircle className="h-4 w-4 ml-auto text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusClick('active')}
            disabled={currentStatus === 'active' || questionCount === 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Activate Form</span>
            {questionCount === 0 && (
              <AlertCircle className="h-4 w-4 ml-auto text-muted-foreground" />
            )}
            {currentStatus === 'active' && <CheckCircle className="h-4 w-4 ml-auto text-primary" />}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleStatusClick('archived')}
            disabled={currentStatus === 'archived'}
          >
            <Archive className="h-4 w-4 mr-2" />
            <span>Archive Form</span>
            {currentStatus === 'archived' && <CheckCircle className="h-4 w-4 ml-auto text-primary" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Activate Confirmation Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make your form live and available to collect responses. You can continue editing the form while it's active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivateConfirm}>
              Activate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive form?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop collecting new responses. Existing responses will still be accessible. You can reactivate the form later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
