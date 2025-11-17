import { ArrowRight, StopCircle } from 'lucide-react';
import { QuestionLogic } from '../types/logic';
import { Question } from '../api/questionsApi';
import { getOperatorLabel } from '../types/logic';
import { cn } from '@/lib/utils';

interface LogicSummaryProps {
  logic: QuestionLogic;
  allQuestions: Question[];
  onHoverTarget?: (targetId: string | null) => void;
}

export const LogicSummary = ({ logic, allQuestions, onHoverTarget }: LogicSummaryProps) => {
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
    const condition = rule.conditions[0]; // Show first condition
    const operator = getOperatorLabel(condition.operator);
    const hasValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
    
    if (hasValue && condition.value) {
      const displayValue = typeof condition.value === 'string' && condition.value.length > 20 
        ? `"${condition.value.substring(0, 20)}..."` 
        : `"${condition.value}"`;
      return `${operator} ${displayValue}`;
    }
    return operator;
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/30">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          <span>Logic Rules</span>
        </div>
        
        {hasRules && logic.rules.map((rule, index) => (
          <div
            key={rule.id || index}
            className={cn(
              "text-xs p-2 rounded-lg transition-all duration-200",
              "bg-muted/30 hover:bg-muted/50 cursor-default"
            )}
            onMouseEnter={() => {
              if (rule.action.type === 'jump' && rule.action.target_question_id) {
                onHoverTarget?.(rule.action.target_question_id);
              }
            }}
            onMouseLeave={() => onHoverTarget?.(null)}
          >
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground shrink-0">•</span>
              <div className="flex-1 space-y-1">
                <div className="text-muted-foreground">
                  If answer {formatCondition(rule)}
                  {rule.conditions.length > 1 && (
                    <span className="ml-1 text-muted-foreground/70">
                      +{rule.conditions.length - 1} more
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {rule.action.type === 'jump' && rule.action.target_question_id ? (
                    <>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="font-medium text-primary">
                        Jump to {getQuestionLabel(rule.action.target_question_id)}
                      </span>
                    </>
                  ) : (
                    <>
                      <StopCircle className="h-3 w-3 text-destructive" />
                      <span className="font-medium text-destructive">End form</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Default Action */}
        <div
          className={cn(
            "text-xs p-2 rounded-lg transition-all duration-200",
            "bg-muted/20 hover:bg-muted/30 cursor-default"
          )}
          onMouseEnter={() => {
            if (logic.default_action === 'next' && logic.default_target) {
              onHoverTarget?.(logic.default_target);
            }
          }}
          onMouseLeave={() => onHoverTarget?.(null)}
        >
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground shrink-0">•</span>
            <div className="flex-1">
              <div className="text-muted-foreground mb-1">Otherwise</div>
              <div className="flex items-center gap-1.5">
                {logic.default_action === 'end' ? (
                  <>
                    <StopCircle className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">End form</span>
                  </>
                ) : logic.default_target ? (
                  <>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Jump to {getQuestionLabel(logic.default_target)}
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Next question</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
