import { Badge } from '@/components/ui/badge';
import { generatePersona, getInitialsFromName } from '@/shared/utils/personaGenerator';
import { formatTimeAgo, formatDuration } from '@/shared/utils/timeFormatter';
import { ResponseWithAnswers } from '../api/analyticsApi';
import { cn } from '@/lib/utils';

interface ResponseItemProps {
  response: ResponseWithAnswers;
  totalQuestions: number;
  questions: Array<{ id: string; type: string; label: string }>;
  onClick?: () => void;
}

export const ResponseItem = ({ response, totalQuestions, questions, onClick }: ResponseItemProps) => {
  // Find respondent name from answers
  const getRespondentInfo = () => {
    const nameQuestion = questions.find((q) => q.type === 'respondent_name');
    
    if (nameQuestion) {
      const nameAnswer = response.answers.find((a) => a.question_id === nameQuestion.id);
      if (nameAnswer?.answer_value && String(nameAnswer.answer_value).trim()) {
        const name = String(nameAnswer.answer_value).trim();
        return {
          name,
          initials: getInitialsFromName(name),
          isAnonymous: false,
        };
      }
    }
    
    // Fallback to Anonymous with session ID
    return {
      name: `Anonymous (${response.session_token.slice(0, 6)})`,
      initials: 'AN',
      isAnonymous: true,
    };
  };

  const respondent = getRespondentInfo();
  const persona = generatePersona(response.session_token);
  const timeAgo = formatTimeAgo(response.started_at);
  const isComplete = response.status === 'completed';
  
  const answeredCount = response.answers.length;
  
  // Calculate duration
  const duration = response.completed_at
    ? Math.floor((new Date(response.completed_at).getTime() - new Date(response.started_at).getTime()) / 1000)
    : Math.floor((new Date().getTime() - new Date(response.started_at).getTime()) / 1000);

  return (
    <div
      className="glass-panel rounded-lg p-3 md:p-4 hover:bg-accent/5 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3 md:gap-4">
        {/* Avatar */}
        <div className={cn('w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm shrink-0', persona.avatarColor)}>
          {respondent.initials}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
            <span className={cn('font-medium text-sm md:text-base truncate', respondent.isAnonymous && 'text-muted-foreground')}>
              {respondent.name}
            </span>
            <Badge variant={isComplete ? 'default' : 'secondary'} className="text-[10px] md:text-xs w-fit">
              {isComplete ? 'Complete' : 'In Progress'}
            </Badge>
          </div>
          
          <p className="text-xs md:text-sm text-muted-foreground">
            {isComplete
              ? `Completed ${answeredCount} questions • ${formatDuration(duration)}`
              : <>Currently at <strong>question {answeredCount + 1}</strong></>
            }
          </p>
        </div>
        
        {/* Time */}
        <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap shrink-0">
          {timeAgo}
        </div>
      </div>
    </div>
  );
};
