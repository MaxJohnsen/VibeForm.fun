import { Badge } from '@/components/ui/badge';
import { generatePersona } from '@/shared/utils/personaGenerator';
import { formatTimeAgo, formatDuration } from '@/shared/utils/timeFormatter';
import { ResponseWithAnswers } from '../api/analyticsApi';
import { cn } from '@/lib/utils';

interface ResponseItemProps {
  response: ResponseWithAnswers;
  totalQuestions: number;
  onClick?: () => void;
}

export const ResponseItem = ({ response, totalQuestions, onClick }: ResponseItemProps) => {
  const persona = generatePersona(response.session_token);
  const timeAgo = formatTimeAgo(response.started_at);
  const isComplete = response.status === 'completed';
  
  const answeredCount = response.answers.length;
  
  // Calculate duration
  const duration = response.completed_at
    ? Math.floor((new Date(response.completed_at).getTime() - new Date(response.started_at).getTime()) / 1000)
    : Math.floor((new Date().getTime() - new Date(response.started_at).getTime()) / 1000);
  
  const progressText = isComplete
    ? `Completed all ${totalQuestions} questions • ${formatDuration(duration)}`
    : `Answered ${answeredCount} of ${totalQuestions} questions • ${formatDuration(duration)}`;

  return (
    <div
      className="glass-panel rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm', persona.avatarColor)}>
          {persona.initials}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{persona.name}</span>
            <Badge variant={isComplete ? 'default' : 'secondary'} className="text-xs">
              {isComplete ? 'Complete' : 'In Progress'}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {progressText}
          </p>
        </div>
        
        {/* Time */}
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {timeAgo}
        </div>
      </div>
    </div>
  );
};
