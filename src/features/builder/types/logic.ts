import { QuestionType } from '@/shared/constants/questionTypes';

export type LogicOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'greater_than' 
  | 'less_than' 
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty' 
  | 'is_not_empty'
  | 'before'
  | 'after';

export type ConditionOperator = 'AND' | 'OR';

export type ActionType = 'jump' | 'end';

export interface LogicCondition {
  field: string; // 'answer' for current question's answer
  operator: LogicOperator;
  value: any; // comparison value
}

export interface LogicAction {
  type: ActionType;
  target_question_id?: string; // Required if type is 'jump'
}

export interface LogicRule {
  id: string;
  conditions: LogicCondition[];
  conditionOperator: ConditionOperator;
  action: LogicAction;
}

export interface QuestionLogic {
  rules: LogicRule[];
  default_action: 'next' | 'end';
  default_target?: string; // Optional: specific question to jump to
}

// Helper function to get available operators for a question type
export const getOperatorsForQuestionType = (questionType: QuestionType): LogicOperator[] => {
  const operatorMap: Record<QuestionType, LogicOperator[]> = {
    short_text: ['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'],
    long_text: ['equals', 'not_equals', 'contains', 'not_contains', 'is_empty', 'is_not_empty'],
    multiple_choice: ['equals', 'not_equals', 'contains'],
    yes_no: ['equals'],
    rating: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal'],
    email: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty'],
    phone: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty'],
    date: ['equals', 'not_equals', 'before', 'after'],
  };

  return operatorMap[questionType] || [];
};

// Helper function to get operator display label
export const getOperatorLabel = (operator: LogicOperator): string => {
  const labels: Record<LogicOperator, string> = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    greater_than: 'is greater than',
    less_than: 'is less than',
    greater_than_or_equal: 'is greater than or equal to',
    less_than_or_equal: 'is less than or equal to',
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
    before: 'is before',
    after: 'is after',
  };

  return labels[operator];
};
