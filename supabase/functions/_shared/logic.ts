/**
 * Logic evaluation types and functions for form conditional branching
 */

export interface LogicCondition {
  field: string;
  operator: string;
  value: any;
}

export interface LogicAction {
  type: 'jump' | 'end';
  target_question_id?: string;
}

export interface LogicRule {
  id: string;
  conditions: LogicCondition[];
  conditionOperator: 'AND' | 'OR';
  action: LogicAction;
}

export interface QuestionLogic {
  rules: LogicRule[];
  default_action: 'next' | 'end';
  default_target?: string;
}

/**
 * Evaluate a logic rule against an answer value
 */
export function evaluateRule(rule: LogicRule, answerValue: any): boolean {
  const results = rule.conditions.map(condition => 
    evaluateCondition(condition, answerValue)
  );
  
  if (rule.conditionOperator === 'AND') {
    return results.every(r => r);
  } else {
    return results.some(r => r);
  }
}

/**
 * Evaluate a single condition against an answer value
 */
export function evaluateCondition(condition: LogicCondition, answerValue: any): boolean {
  const { operator, value } = condition;

  switch (operator) {
    case 'equals':
      return answerValue === value;
    case 'not_equals':
      return answerValue !== value;
    case 'contains':
      return String(answerValue).includes(String(value));
    case 'not_contains':
      return !String(answerValue).includes(String(value));
    case 'greater_than':
      return Number(answerValue) > Number(value);
    case 'less_than':
      return Number(answerValue) < Number(value);
    case 'greater_than_or_equal':
      return Number(answerValue) >= Number(value);
    case 'less_than_or_equal':
      return Number(answerValue) <= Number(value);
    case 'is_empty':
      return !answerValue || answerValue === '' || 
        (Array.isArray(answerValue) && answerValue.length === 0);
    case 'is_not_empty':
      return !!answerValue && answerValue !== '' && 
        (!Array.isArray(answerValue) || answerValue.length > 0);
    case 'before':
      return new Date(answerValue) < new Date(value);
    case 'after':
      return new Date(answerValue) > new Date(value);
    default:
      return false;
  }
}
