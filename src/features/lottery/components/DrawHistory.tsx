import { LotteryDraw } from '../api/lotteryApi';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface DrawHistoryProps {
  draws: LotteryDraw[];
  onDelete: (drawId: string) => void;
  isDeletingDraw: boolean;
}

export const DrawHistory = ({ draws, onDelete, isDeletingDraw }: DrawHistoryProps) => {
  if (draws.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-1">
        Draw Log
      </h3>

      <div className="space-y-1.5">
        {draws.map((draw) => {
          const timeAgo = formatDistanceToNow(new Date(draw.drawnAt), { addSuffix: true });
          const winnerNames = draw.winners.map((winner) => {
            const displayName = (typeof winner.name === 'string' && winner.name.trim()) 
              ? winner.name 
              : `Anon (${winner.sessionToken.slice(0, 6)})`;
            return displayName;
          }).join(', ');

          return (
            <div
              key={draw.id}
              className="group flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-background/50 transition-colors text-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                  <span>{timeAgo}</span>
                  <span>•</span>
                  <span>{draw.winners.length} {draw.winners.length === 1 ? 'winner' : 'winners'}</span>
                </div>
                <div className="text-foreground truncate">
                  {winnerNames}
                </div>
              </div>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                    disabled={isDeletingDraw}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Draw?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this lottery draw from your history. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(draw.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
        })}
      </div>
    </div>
  );
};
