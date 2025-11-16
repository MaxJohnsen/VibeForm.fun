import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogicCondition, getOperatorsForQuestionType, getOperatorLabel } from '../types/logic';
import { QuestionType } from '@/shared/constants/questionTypes';

interface ConditionBuilderProps {
  condition: LogicCondition;
  questionType: string;
  onUpdate: (updates: Partial<LogicCondition>) => void;
  onDelete: () => void;
  showDelete: boolean;
}

export const ConditionBuilder = ({
  condition,
  questionType,
  onUpdate,
  onDelete,
  showDelete,
}: ConditionBuilderProps) => {
  const operators = getOperatorsForQuestionType(questionType as QuestionType);
  const needsValueInput = !['is_empty', 'is_not_empty'].includes(condition.operator);

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-background border border-border/50">
      <div className="flex-1 space-y-2">
        {/* Operator Select */}
        <Select
          value={condition.operator}
          onValueChange={(value) => onUpdate({ operator: value as any })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {operators.map((op) => (
              <SelectItem key={op} value={op}>
                {getOperatorLabel(op)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Value Input */}
        {needsValueInput && (
          <Input
            placeholder="Enter value..."
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="w-full"
          />
        )}
      </div>

      {/* Delete Button */}
      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={onDelete}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
};
