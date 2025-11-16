import { useState } from 'react';
import { QuestionLogic, LogicRule } from '../types/logic';
import { v4 as uuidv4 } from 'uuid';

export const useLogic = (initialLogic?: QuestionLogic) => {
  const [logic, setLogic] = useState<QuestionLogic>(
    initialLogic || {
      rules: [],
      default_action: 'next',
    }
  );

  const addRule = () => {
    const newRule: LogicRule = {
      id: uuidv4(),
      conditions: [
        {
          field: 'answer',
          operator: 'equals',
          value: '',
        },
      ],
      conditionOperator: 'AND',
      action: {
        type: 'jump',
      },
    };

    setLogic({
      ...logic,
      rules: [...logic.rules, newRule],
    });
  };

  const updateRule = (ruleId: string, updates: Partial<LogicRule>) => {
    setLogic({
      ...logic,
      rules: logic.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ),
    });
  };

  const deleteRule = (ruleId: string) => {
    setLogic({
      ...logic,
      rules: logic.rules.filter((rule) => rule.id !== ruleId),
    });
  };

  const updateDefaultAction = (action: 'next' | 'end', target?: string) => {
    setLogic({
      ...logic,
      default_action: action,
      default_target: target,
    });
  };

  return {
    logic,
    setLogic,
    addRule,
    updateRule,
    deleteRule,
    updateDefaultAction,
  };
};
