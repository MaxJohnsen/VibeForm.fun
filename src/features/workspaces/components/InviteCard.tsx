import { Check, X, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PendingInvite } from '../api/workspacesApi';
import { cn } from '@/lib/utils';

interface InviteCardProps {
  invite: PendingInvite;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  isProcessing?: boolean;
  className?: string;
}

export const InviteCard = ({
  invite,
  onAccept,
  onDecline,
  isProcessing = false,
  className,
}: InviteCardProps) => {
  return (
    <div
      className={cn(
        'group relative',
        'bg-background/60 backdrop-blur-sm',
        'border border-border/60 hover:border-primary/30',
        'rounded-2xl p-5',
        'transition-all duration-300',
        'hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative space-y-4">
        {/* Workspace Info */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {invite.workspace_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Invited as <span className="capitalize font-medium text-foreground/80">{invite.role}</span>
              {invite.invited_by_email && (
                <span className="text-muted-foreground"> by {invite.invited_by_email}</span>
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            size="sm"
            variant="default"
            className="flex-1 h-10 rounded-xl"
            disabled={isProcessing}
            onClick={() => onAccept(invite.id)}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                Accept
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-10 rounded-xl"
            disabled={isProcessing}
            onClick={() => onDecline(invite.id)}
          >
            <X className="h-4 w-4 mr-1.5" />
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
};
