import { useState, useEffect } from 'react';
import { X, Plus, GitBranch } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Question } from '../api/questionsApi';
import { QuestionLogic } from '../types/logic';
import { useLogic } from '../hooks/useLogic';
import { LogicRuleCard } from './LogicRuleCard';
import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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

  // Generate a key that changes when any question position changes
  const questionsPositionKey = availableQuestions.map(q => `${q.id}:${q.position}`).join('|');

  // Shared content JSX
  const logicContentJSX = (
    <>
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

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={logic.default_action}
            onValueChange={(value: 'next' | 'end') => {
              updateDefaultAction(value, value === 'next' ? undefined : logic.default_target);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[200]">
              <SelectItem value="next">Go to next question</SelectItem>
              <SelectItem value="end">End form</SelectItem>
            </SelectContent>
          </Select>

          {logic.default_action === 'next' && availableQuestions.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">or jump to</span>
              <Select
                key={`default-select-${questionsPositionKey}`}
                value={logic.default_target || 'none'}
                onValueChange={(value) => {
                  updateDefaultAction('next', value === 'none' ? undefined : value);
                }}
              >
                <SelectTrigger className="flex-1 min-w-[200px]">
                  <SelectValue placeholder="Next question" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
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
    </>
  );

  // Mobile: Full-screen Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[100dvh] w-full p-0 bg-background z-[150] flex flex-col border-none">
          <SheetTitle className="sr-only">Question Logic</SheetTitle>
          <SheetDescription className="sr-only">
            Configure logic rules for this question
          </SheetDescription>

          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`h-8 w-8 rounded-lg ${questionTypeInfo?.colorClass} flex items-center justify-center flex-shrink-0`}
              >
                {questionTypeInfo && <questionTypeInfo.icon className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">Logic Rules</h3>
                <p className="text-xs text-muted-foreground truncate">{question.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
            {logicContentJSX}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col z-[150]">
        <DialogHeader>
          <DialogDescription className="sr-only">
            Configure logic rules for this question
          </DialogDescription>
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
          {logicContentJSX}
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

