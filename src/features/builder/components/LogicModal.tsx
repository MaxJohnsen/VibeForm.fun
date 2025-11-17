import { useState, useEffect } from 'react';
import { X, Plus, GitBranch } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Question } from '../api/questionsApi';
import { QuestionLogic } from '../types/logic';
import { useLogic } from '../hooks/useLogic';
import { LogicRuleCard } from './LogicRuleCard';
import { QUESTION_TYPES } from '@/shared/constants/questionTypes';

interface LogicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Question;
  allQuestions: Question[];
  onSave: (logic: QuestionLogic) => void;
}

export const LogicModal = ({
  open,
  onOpenChange,
  question,
  allQuestions,
  onSave,
}: LogicModalProps) => {
  const { logic, setLogic, addRule, updateRule, deleteRule, updateDefaultAction } = useLogic();

  // Initialize logic when modal opens
  useEffect(() => {
    if (open && question.logic) {
      setLogic(question.logic as QuestionLogic);
    } else if (open) {
      setLogic({
        rules: [],
        default_action: 'next',
      });
    }
  }, [open, question.logic, setLogic]);

  const handleSave = () => {
    onSave(logic);
    onOpenChange(false);
  };

  const questionTypeInfo = QUESTION_TYPES.find((t) => t.type === question.type);
  const availableQuestions = allQuestions.filter((q) => q.id !== question.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg ${questionTypeInfo?.colorClass} flex items-center justify-center flex-shrink-0`}
            >
              {questionTypeInfo && <questionTypeInfo.icon className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg">Question Logic</DialogTitle>
              <p className="text-sm text-muted-foreground truncate">{question.label}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Rules Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Conditional Rules</h3>
                <p className="text-xs text-muted-foreground">
                  Rules are evaluated in order. First match wins.
                </p>
              </div>
              <Button size="sm" onClick={addRule}>
                <Plus className="h-4 w-4 mr-1" />
                Add Rule
              </Button>
            </div>

            {logic.rules.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GitBranch className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm">No logic rules yet</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add conditions to create custom question flows based on answers
                  </p>
                </div>
                <Button onClick={addRule} variant="outline" size="sm">
                  Add Your First Rule
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {logic.rules.map((rule, index) => (
                  <LogicRuleCard
                    key={rule.id}
                    rule={rule}
                    ruleIndex={index}
                    questionType={question.type}
                    allQuestions={allQuestions}
                    currentQuestionId={question.id}
                    onUpdateRule={updateRule}
                    onDeleteRule={deleteRule}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Default Action Section */}
          <div className="border-t border-border pt-6 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Default Action</h3>
              <p className="text-xs text-muted-foreground">
                If none of the above conditions are met
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={logic.default_action}
                onValueChange={(value: 'next' | 'end') => {
                  updateDefaultAction(value, value === 'next' ? undefined : logic.default_target);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="next">Go to next question</SelectItem>
                  <SelectItem value="end">End form</SelectItem>
                </SelectContent>
              </Select>

              {logic.default_action === 'next' && availableQuestions.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">or jump to</span>
                  <Select
                    value={logic.default_target || 'none'}
                    onValueChange={(value) => {
                      updateDefaultAction('next', value === 'none' ? undefined : value);
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Next question" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Next question</SelectItem>
                      {availableQuestions.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          Q{q.position + 1}: {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Logic</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
