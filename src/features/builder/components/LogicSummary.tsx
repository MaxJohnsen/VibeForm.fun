import { ArrowRight, StopCircle, ChevronDown } from 'lucide-react';
import { QuestionLogic } from '../types/logic';
import { Question } from '../api/questionsApi';
import { getOperatorLabel } from '../types/logic';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LogicSummaryProps {
  logic: QuestionLogic;
  allQuestions: Question[];
}

export const LogicSummary = ({ logic, allQuestions }: LogicSummaryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasRules = logic.rules && logic.rules.length > 0;
  
  if (!hasRules && logic.default_action === 'next') {
    return null;
  }

  const getQuestionLabel = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return 'Unknown';
    const index = allQuestions.indexOf(question);
    return `Q${index + 1}`;
  };

  const formatCondition = (rule: any) => {
    const condition = rule.conditions[0];
    const operator = getOperatorLabel(condition.operator);
    const hasValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
    
    if (hasValue && condition.value) {
      const displayValue = typeof condition.value === 'string' && condition.value.length > 15 
        ? `"${condition.value.substring(0, 15)}..."` 
        : `"${condition.value}"`;
      return `${operator} ${displayValue}`;
    }
    return operator;
  };

  const formatAction = (action: any) => {
    if (action.type === 'jump' && action.target_question_id) {
      return `→ ${getQuestionLabel(action.target_question_id)}`;
    }
    return '→ End';
  };

  return (
    <div className="mt-3 pt-3 border-t border-border/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="font-medium">
          {hasRules ? `${logic.rules.length} rule${logic.rules.length > 1 ? 's' : ''}` : 'Default flow'}
        </span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform duration-200",
          isExpanded && "rotate-180"
        )} />
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-1 animate-fade-in">
          {hasRules && logic.rules.map((rule, index) => (
            <div
              key={rule.id || index}
              className="text-xs py-1.5 px-2 rounded bg-muted/20 flex items-center justify-between gap-2"
            >
              <span className="text-muted-foreground truncate flex-1">
                If {formatCondition(rule)}
                {rule.conditions.length > 1 && ` +${rule.conditions.length - 1}`}
              </span>
              <span className={cn(
                "font-medium shrink-0",
                rule.action.type === 'end' ? 'text-destructive' : 'text-primary'
              )}>
                {formatAction(rule.action)}
              </span>
            </div>
          ))}
          
          <div className="text-xs py-1.5 px-2 rounded bg-muted/10 flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Otherwise</span>
            <span className="text-muted-foreground shrink-0">
              {logic.default_action === 'end' ? '→ End' : 
               logic.default_target ? `→ ${getQuestionLabel(logic.default_target)}` : 
               '→ Next'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
