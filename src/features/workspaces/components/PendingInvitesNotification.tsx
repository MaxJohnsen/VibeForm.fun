import { useState, useEffect } from 'react';
import { Mail, Check, X, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { InlineLoader } from '@/shared/ui';
import { workspacesApi, PendingInvite } from '../api/workspacesApi';
import { useWorkspaceContext } from '../context/WorkspaceContext';

export const PendingInvitesNotification = () => {
  const { toast } = useToast();
  const { refetch } = useWorkspaceContext();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const loadInvites = async () => {
    try {
      const data = await workspacesApi.getMyPendingInvites();
      setInvites(data);
    } catch (error) {
      console.error('Failed to load pending invites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleAccept = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      await workspacesApi.acceptInvite(inviteId);
      await loadInvites();
      await refetch();
      toast({
        title: 'Invite accepted',
        description: 'You have joined the workspace',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept invite',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessingId(inviteId);
    try {
      await workspacesApi.declineInvite(inviteId);
      await loadInvites();
      toast({
        title: 'Invite declined',
        description: 'The invitation has been declined',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to decline invite',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              className="relative w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
              aria-label="Pending invites"
            >
              <Mail className="h-5 w-5" />
              {invites.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {invites.length}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="font-medium">
          Invitations
        </TooltipContent>
      </Tooltip>
      <PopoverContent 
        side="right" 
        align="end" 
        sideOffset={16}
        className="w-80 p-0 glass-panel border-border/50"
      >
        <div className="p-3 border-b border-border/50">
          <h3 className="font-semibold">Workspace Invites</h3>
          <p className="text-xs text-muted-foreground">
            {invites.length > 0 
              ? `${invites.length} pending invite${invites.length !== 1 ? 's' : ''}`
              : 'No pending invites'
            }
          </p>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <InlineLoader />
            </div>
          ) : invites.length === 0 ? (
            <div className="py-8 text-center">
              <Inbox className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">No pending invitations</p>
              <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {invites.map((invite) => (
                <div key={invite.id} className="p-3 space-y-2">
                  <div>
                    <p className="font-medium text-sm">{invite.workspace_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited as <span className="capitalize">{invite.role}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      disabled={processingId === invite.id}
                      onClick={() => handleAccept(invite.id)}
                    >
                      {processingId === invite.id ? (
                        <InlineLoader size="sm" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      disabled={processingId === invite.id}
                      onClick={() => handleDecline(invite.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
