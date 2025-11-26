import { LotteryDraw } from '../api/lotteryApi';
import { generatePersona } from '@/shared/utils/personaGenerator';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Calendar, Users, Settings } from 'lucide-react';
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
    return (
      <div className="glass-panel rounded-2xl p-8">
        <div className="text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No draws yet</p>
          <p className="text-sm mt-1">Draw your first winner to see history here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Draw History</h2>

      <div className="space-y-3">
        {draws.map((draw) => (
          <div
            key={draw.id}
            className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-border transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(draw.drawnAt), { addSuffix: true })}
                  </span>
                </div>

                {/* Settings */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium">{draw.winners.length}</span>
                    <span className="text-muted-foreground">
                      {draw.winners.length === 1 ? 'winner' : 'winners'}
                    </span>
                  </div>
                  {draw.settings.namedOnly && (
                    <div className="flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Named only</span>
                    </div>
                  )}
                </div>

                {/* Winners */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {draw.winners.map((winner, index) => {
                    const persona = generatePersona(winner.sessionToken);
                    const displayName = winner.name || persona.name;
                    return (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
                      >
                        <div className={`w-6 h-6 rounded-full ${persona.avatarColor} flex items-center justify-center`}>
                          <span className="text-xs font-bold text-white">
                            {persona.initials}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {displayName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={isDeletingDraw}
                  >
                    <Trash2 className="w-4 h-4" />
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
          </div>
        ))}
      </div>
    </div>
  );
};
