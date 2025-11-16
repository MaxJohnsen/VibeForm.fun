import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogicRule, LogicCondition } from '../types/logic';
import { Question } from '../api/questionsApi';
import { ConditionBuilder } from './ConditionBuilder';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface LogicRuleCardProps {
  rule: LogicRule;
  ruleIndex: number;
  questionType: string;
  allQuestions: Question[];
  currentQuestionId: string;
  onUpdateRule: (ruleId: string, updates: Partial<LogicRule>) => void;
  onDeleteRule: (ruleId: string) => void;
}

export const LogicRuleCard = ({
  rule,
  ruleIndex,
  questionType,
  allQuestions,
  currentQuestionId,
  onUpdateRule,
  onDeleteRule,
}: LogicRuleCardProps) => {
  const addCondition = () => {
    const newCondition: LogicCondition = {
      field: 'answer',
      operator: 'equals',
      value: '',
    };

    onUpdateRule(rule.id, {
      conditions: [...rule.conditions, newCondition],
    });
  };

  const updateCondition = (conditionIndex: number, updates: Partial<LogicCondition>) => {
    const updatedConditions = rule.conditions.map((condition, index) =>
      index === conditionIndex ? { ...condition, ...updates } : condition
    );

    onUpdateRule(rule.id, { conditions: updatedConditions });
  };

  const deleteCondition = (conditionIndex: number) => {
    onUpdateRule(rule.id, {
      conditions: rule.conditions.filter((_, index) => index !== conditionIndex),
    });
  };

  const availableQuestions = allQuestions.filter((q) => q.id !== currentQuestionId);

  return (
    <div className="border border-border/50 rounded-xl p-4 space-y-4 bg-muted/30">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
            {ruleIndex + 1}
          </div>
          <span className="text-sm font-medium">Rule {ruleIndex + 1}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onDeleteRule(rule.id)}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground uppercase">IF</div>
        
        {rule.conditions.map((condition, index) => (
          <div key={index}>
            {index > 0 && (
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-border" />
                <Select
                  value={rule.conditionOperator}
                  onValueChange={(value: 'AND' | 'OR') =>
                    onUpdateRule(rule.id, { conditionOperator: value })
                  }
                >
                  <SelectTrigger className="w-20 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
            
            <ConditionBuilder
              condition={condition}
              questionType={questionType}
              onUpdate={(updates) => updateCondition(index, updates)}
              onDelete={() => deleteCondition(index)}
              showDelete={rule.conditions.length > 1}
            />
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs"
          onClick={addCondition}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Condition
        </Button>
      </div>

      {/* Action */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase">THEN</div>
        
        <div className="flex items-center gap-2">
          <Select
            value={rule.action.type}
            onValueChange={(value: 'jump' | 'end') => {
              onUpdateRule(rule.id, {
                action: {
                  type: value,
                  target_question_id: value === 'jump' ? rule.action.target_question_id : undefined,
                },
              });
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jump">Go to</SelectItem>
              <SelectItem value="end">End form</SelectItem>
            </SelectContent>
          </Select>

          {rule.action.type === 'jump' && (
            <Select
              value={rule.action.target_question_id || ''}
              onValueChange={(value) => {
                onUpdateRule(rule.id, {
                  action: {
                    ...rule.action,
                    target_question_id: value,
                  },
                });
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select question..." />
              </SelectTrigger>
              <SelectContent>
                {availableQuestions.map((q, idx) => (
                  <SelectItem key={q.id} value={q.id}>
                    Q{idx + 1}: {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};
