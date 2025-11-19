import { useState } from 'react';
import { CheckCircle, FileEdit, Archive, AlertCircle, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
            <Button variant="outline" size="sm" className="gap-2">
              <span className="text-xs text-muted-foreground">Status:</span>
              {getStatusIcon(currentStatus)}
              <span className="font-medium capitalize">{currentStatus}</span>
              <ChevronDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Change form status
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {currentStatus !== 'active' && (
            <DropdownMenuItem
              onClick={() => handleStatusClick('active')}
              disabled={questionCount === 0}
              className="flex-col items-start py-3 cursor-pointer"
            >
              <div className="flex items-center w-full">
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">Activate Form</span>
              </div>
              <span className="text-xs text-muted-foreground ml-6 mt-1">
                Make live and start collecting responses
              </span>
            </DropdownMenuItem>
          )}
          
          {currentStatus !== 'draft' && (
            <DropdownMenuItem
              onClick={() => handleStatusClick('draft')}
              className="flex-col items-start py-3 cursor-pointer"
            >
              <div className="flex items-center w-full">
                <FileEdit className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">Move to Draft</span>
              </div>
              <span className="text-xs text-muted-foreground ml-6 mt-1">
                Continue editing before going live
              </span>
            </DropdownMenuItem>
          )}
          
          {currentStatus !== 'archived' && (
            <DropdownMenuItem
              onClick={() => handleStatusClick('archived')}
              className="flex-col items-start py-3 cursor-pointer"
            >
              <div className="flex items-center w-full">
                <Archive className="h-4 w-4 mr-2 text-orange-600" />
                <span className="font-medium">Archive Form</span>
              </div>
              <span className="text-xs text-muted-foreground ml-6 mt-1">
                Stop accepting new responses
              </span>
            </DropdownMenuItem>
          )}
          
          {questionCount === 0 && currentStatus === 'draft' && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 text-xs text-amber-600 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Add at least one question before activating this form</span>
              </div>
            </>
          )}
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
