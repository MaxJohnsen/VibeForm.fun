import { useState } from 'react';
import { Shield, User, MoreHorizontal, Trash2, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { WorkspaceMember } from '../api/workspacesApi';
import { useAuth } from '@/features/auth';

interface MemberListProps {
  members: WorkspaceMember[];
  currentUserRole: 'admin' | 'member' | null;
  onUpdateRole: (memberId: string, newRole: 'admin' | 'member') => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  isLoading?: boolean;
}

export const MemberList = ({
  members,
  currentUserRole,
  onUpdateRole,
  onRemoveMember,
  isLoading = false,
}: MemberListProps) => {
  const { user } = useAuth();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    memberId: string;
    action: 'remove' | 'demote';
    memberEmail?: string;
  }>({ open: false, memberId: '', action: 'remove' });

  const isAdmin = currentUserRole === 'admin';
  const adminCount = members.filter(m => m.role === 'admin').length;

  const handleAction = async () => {
    if (confirmDialog.action === 'remove') {
      await onRemoveMember(confirmDialog.memberId);
    } else if (confirmDialog.action === 'demote') {
      await onUpdateRole(confirmDialog.memberId, 'member');
    }
    setConfirmDialog({ open: false, memberId: '', action: 'remove' });
  };

  return (
    <>
      <div className="space-y-2">
        {members.map((member) => {
          const isCurrentUser = member.user_id === user?.id;
          const isLastAdmin = member.role === 'admin' && adminCount === 1;
          const canManage = isAdmin && !isCurrentUser && !isLastAdmin;

          return (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  {member.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {member.email || `User ${member.user_id.slice(0, 8)}...`}
                    </span>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {member.role}
                  </span>
                </div>
              </div>

              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {member.role === 'member' ? (
                      <DropdownMenuItem 
                        onClick={() => onUpdateRole(member.id, 'admin')}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Make Admin
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => setConfirmDialog({
                          open: true,
                          memberId: member.id,
                          action: 'demote',
                          memberEmail: member.email,
                        })}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Demote to Member
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setConfirmDialog({
                        open: true,
                        memberId: member.id,
                        action: 'remove',
                        memberEmail: member.email,
                      })}
                    >
                      <UserMinus className="h-4 w-4 mr-2" />
                      Remove from Workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => 
        setConfirmDialog(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'remove' ? 'Remove Member' : 'Demote Admin'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'remove' 
                ? `Are you sure you want to remove this member from the workspace? They will lose access to all forms and data.`
                : `Are you sure you want to demote this admin to a regular member? They will no longer be able to manage workspace settings or members.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {confirmDialog.action === 'remove' ? 'Remove' : 'Demote'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
