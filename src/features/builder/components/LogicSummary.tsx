import { ArrowRight, GitBranch } from 'lucide-react';
import { QuestionLogic } from '../types/logic';
import { Question } from '../api/questionsApi';
import { getOperatorLabel } from '../types/logic';

interface LogicSummaryProps {
  logic: QuestionLogic;
  allQuestions: Question[];
  currentQuestion: Question;
}

export const LogicSummary = ({ logic, allQuestions, currentQuestion }: LogicSummaryProps) => {
  const hasRules = logic.rules && logic.rules.length > 0;
  const hasCustomDefault = logic.default_action === 'end' || logic.default_target;
  
  const getQuestionLabel = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return 'Unknown';
    return `Q${question.position + 1}`;
  };

  const getNextQuestionLabel = () => {
    const currentIndex = allQuestions.findIndex(q => q.id === currentQuestion.id);
    const nextQuestion = allQuestions[currentIndex + 1];
    return nextQuestion ? getQuestionLabel(nextQuestion.id) : null;
  };

  const buildSummaryText = () => {
    // Scenario 1: Has rules
    if (hasRules && logic.rules.length > 0) {
      const firstRule = logic.rules[0];
      const condition = firstRule.conditions[0];
      const operator = getOperatorLabel(condition.operator);
      
      // Format condition value
      const hasValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
      let conditionText = operator;
      
      if (hasValue && condition.value) {
        const displayValue = typeof condition.value === 'string' && condition.value.length > 15 
          ? `"${condition.value.substring(0, 15)}..."` 
          : `"${condition.value}"`;
        conditionText = `${operator} ${displayValue}`;
      }
      
      // Format action
      const actionTarget = firstRule.action.type === 'end' 
        ? 'end' 
        : getQuestionLabel(firstRule.action.target_question_id!);
      
      // Format otherwise
      const otherwiseTarget = logic.default_action === 'end' 
        ? 'end' 
        : logic.default_target 
          ? getQuestionLabel(logic.default_target) 
          : getNextQuestionLabel() || 'next';
      
      return `If ${conditionText} → ${actionTarget}; otherwise → ${otherwiseTarget}`;
    }
    
    // Scenario 2: No rules, but custom default
    if (!hasRules && hasCustomDefault) {
      if (logic.default_action === 'end') {
        return 'Skips to end';
      }
      return `Skips to ${getQuestionLabel(logic.default_target!)}`;
    }
    
    // Scenario 3: Natural flow (show next question)
    const nextLabel = getNextQuestionLabel();
    if (nextLabel) {
      return nextLabel;
    }
    
    // Scenario 4: Last question, no custom logic
    return null;
  };

  const summaryText = buildSummaryText();
  
  if (!summaryText) {
    return null;
  }

  // Determine icon
  const Icon = hasRules ? GitBranch : ArrowRight;

  return (
    <div className="mt-3 pt-3 border-t border-border/20">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{summaryText}</span>
      </div>
    </div>
  );
};
