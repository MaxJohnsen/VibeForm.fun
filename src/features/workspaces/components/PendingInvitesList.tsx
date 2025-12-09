import { Clock, Mail, MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkspaceInvite } from '../api/workspacesApi';
import { formatDistanceToNow } from 'date-fns';

interface PendingInvitesListProps {
  invites: WorkspaceInvite[];
  onCancelInvite: (inviteId: string) => Promise<void>;
  isLoading?: boolean;
}

export const PendingInvitesList = ({
  invites,
  onCancelInvite,
  isLoading = false,
}: PendingInvitesListProps) => {
  if (invites.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No pending invites
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {invites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{invite.email}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {invite.role}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Sent {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onCancelInvite(invite.id)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Invite
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
};
