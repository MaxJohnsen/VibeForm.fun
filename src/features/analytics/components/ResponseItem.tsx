import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { generatePersona, getInitialsFromName } from '@/shared/utils/personaGenerator';
import { formatTimeAgo, formatDuration } from '@/shared/utils/timeFormatter';
import { formatAnswerValue } from '../utils/formatAnswerValue';
import { ResponseWithAnswers } from '../api/analyticsApi';
import { cn } from '@/lib/utils';

interface ResponseItemProps {
  response: ResponseWithAnswers;
  totalQuestions: number;
  questions: Array<{ id: string; type: string; label: string; settings?: any }>;
  onClick?: () => void;
}

export const ResponseItem = ({ response, totalQuestions, questions, onClick }: ResponseItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Find respondent name from answers
  const getRespondentInfo = () => {
    const nameQuestion = questions.find((q) => q.type === 'respondent_name');
    
    if (nameQuestion) {
      const nameAnswer = response.answers.find((a) => a.question_id === nameQuestion.id);
      if (nameAnswer?.answer_value) {
        // Handle both string and object answer values
        let name: string = '';
        
        if (typeof nameAnswer.answer_value === 'string') {
          name = nameAnswer.answer_value.trim();
        } else if (typeof nameAnswer.answer_value === 'object' && nameAnswer.answer_value !== null) {
          // If it's an object, try to extract the value
          const answerObj = nameAnswer.answer_value as any;
          name = String(answerObj.value || answerObj.text || answerObj.name || '').trim();
        }
        
        if (name && name !== '[object Object]') {
          return {
            name,
            initials: getInitialsFromName(name),
            isAnonymous: false,
          };
        }
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
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
            
            {/* Chevron indicator */}
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0",
                isOpen && "rotate-180"
              )} 
            />
          </div>
        </div>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="mt-2 ml-11 md:ml-14 mr-3 md:mr-4 space-y-2 p-3 rounded-lg bg-muted/30">
          {questions.map(question => {
            const answer = response.answers.find(a => a.question_id === question.id);
            const formattedValue = formatAnswerValue(
              answer?.answer_value,
              question.type,
              question.settings
            );
            
            return (
              <div key={question.id} className="flex justify-between gap-4 text-sm">
                <span className="text-muted-foreground truncate flex-1">
                  {question.label}
                </span>
                <span className="font-medium text-right shrink-0 max-w-[50%] truncate">
                  {formattedValue}
                </span>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
