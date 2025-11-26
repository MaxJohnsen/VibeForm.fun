import { useState, useEffect, useRef } from 'react';
import { GripVertical, Trash2, Mail, Phone, Calendar, Star, GitBranch, ArrowRight, MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Question } from '../api/questionsApi';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MultipleChoiceSettings,
  YesNoSettings,
  RatingSettings,
  EmailSettings,
  PhoneSettings,
  DateSettings,
} from '../types/questionSettings';
import { LogicSummary } from './LogicSummary';
import { QuestionLogic } from '../types/logic';

interface QuestionCardProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onOpenLogic?: () => void;
  allQuestions: Question[];
}

export const QuestionCard = ({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
  onOpenLogic,
  allQuestions,
}: QuestionCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isMobile = useIsMobile();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: question.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const logic = question.logic as QuestionLogic | undefined;
  const hasLogic = logic && (logic.rules?.length > 0 || logic.default_target || logic.default_action === 'end');

  // Generate a key that changes when any question position changes
  const questionsPositionKey = allQuestions.map(q => `${q.id}:${q.position}`).join('|');

  // Get logic summary for badge
  const getLogicSummary = () => {
    if (!hasLogic) return '';

    const targets: string[] = [];
    logic.rules?.forEach(rule => {
      if (rule.action.type === 'jump' && rule.action.target_question_id) {
        const targetQ = allQuestions.find(q => q.id === rule.action.target_question_id);
        if (targetQ) {
          const idx = allQuestions.indexOf(targetQ);
          targets.push(`Q${idx + 1}`);
        }
      } else if (rule.action.type === 'end') {
        targets.push('End');
      }
    });

    const ruleCount = logic.rules?.length || 0;
    const uniqueTargets = [...new Set(targets)];

    if (uniqueTargets.length === 0) return `${ruleCount} rule${ruleCount > 1 ? 's' : ''}`;
    return `${ruleCount} rule${ruleCount > 1 ? 's' : ''} → ${uniqueTargets.join(', ')}`;
  };

  return (
    <>
      <div
        ref={setNodeRef}
        data-question-id={question.id}
        style={style}
        className={cn(
          'relative glass-panel p-3 md:p-4 rounded-xl transition-all duration-200 group',
          isSelected
            ? '!border !border-primary shadow-xl shadow-primary/40 ring-4 ring-primary/10'
            : '!border !border-border/30 hover:!border-border',
          isDragging && 'opacity-0',
          !isDragging && 'cursor-pointer'
        )}
        onClick={!isDragging ? onSelect : undefined}
      >
        {/* Action Buttons - Top Right */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
          {onOpenLogic && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden md:flex"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenLogic();
              }}
              title="Edit logic rules"
            >
              <GitBranch className="h-4 w-4 text-primary" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hidden md:flex"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>

          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none p-2 hover:bg-muted/50 rounded-lg h-8 w-8 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Question Number */}
        <div className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs md:text-sm font-semibold text-primary mb-2 md:mb-3">
          {index + 1}
        </div>

        {/* Question Label */}
        <div className="text-base font-medium text-foreground mb-3 md:mb-4">
          {question.label}
        </div>

        {/* Preview Input */}
        <div>
          {question.type === 'short_text' && (
            <Input
              placeholder="Your answer..."
              disabled
              className="opacity-50 border-border/50"
            />
          )}

          {question.type === 'long_text' && (
            <Textarea
              placeholder="Your answer..."
              disabled
              className="opacity-50 resize-none border-border/50"
              rows={2}
            />
          )}

          {question.type === 'multiple_choice' && (() => {
            const settings = question.settings as MultipleChoiceSettings;
            const options = settings?.options || [];
            const allowMultiple = settings?.allowMultiple || false;
            const allowOther = settings?.allowOther || false;

            return (
              <div className="space-y-2">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center gap-3 p-2 md:p-3 rounded-lg border border-border/50 opacity-50">
                    <div className={cn(
                      "w-4 h-4 border-2 border-muted-foreground",
                      allowMultiple ? "rounded" : "rounded-full"
                    )} />
                    <span className="text-sm text-muted-foreground">{option.text}</span>
                  </div>
                ))}

                {allowOther && (
                  <div className="flex items-center gap-3 p-2 md:p-3 rounded-lg border border-border/50 opacity-50">
                    <div className={cn(
                      "w-4 h-4 border-2 border-muted-foreground",
                      allowMultiple ? "rounded" : "rounded-full"
                    )} />
                    <span className="text-sm text-muted-foreground italic">Other</span>
                  </div>
                )}
              </div>
            );
          })()}

          {question.type === 'yes_no' && (() => {
            const settings = question.settings as YesNoSettings;
            const yesLabel = settings?.yesLabel || 'Yes';
            const noLabel = settings?.noLabel || 'No';
            const buttonStyle = settings?.buttonStyle || 'pills';

            const getButtonClasses = (isYes: boolean) => {
              const baseClasses = "flex-1 py-2 px-4 text-sm font-medium opacity-50 transition-all";

              switch (buttonStyle) {
                case 'pills':
                  return cn(
                    baseClasses,
                    "rounded-full border-2",
                    isYes
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                      : "border-border/30 bg-muted/5 text-muted-foreground"
                  );
                case 'boxes':
                  return cn(
                    baseClasses,
                    "rounded-lg border-2",
                    isYes
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                      : "border-border/30 bg-muted/5 text-muted-foreground"
                  );
                case 'toggle':
                  return cn(
                    baseClasses,
                    "rounded-md border-2",
                    isYes
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                      : "border-border/30 bg-muted/5 text-muted-foreground"
                  );
              }
            };

            return (
              <div className="flex gap-3">
                <button disabled className={getButtonClasses(true)}>
                  {yesLabel}
                </button>
                <button disabled className={getButtonClasses(false)}>
                  {noLabel}
                </button>
              </div>
            );
          })()}

          {question.type === 'rating' && (() => {
            const settings = question.settings as RatingSettings;
            const scaleType = settings?.scaleType || 'stars';
            const min = settings?.min || 1;
            const max = settings?.max || 10;
            const minLabel = settings?.minLabel;
            const maxLabel = settings?.maxLabel;

            const scaleLength = max - min + 1;
            const scaleArray = Array.from({ length: scaleLength }, (_, i) => min + i);

            // On mobile, if more than 6 items, show first 3, ellipsis, last 3
            const shouldTruncate = isMobile && scaleLength > 6;
            const displayArray = shouldTruncate
              ? [...scaleArray.slice(0, 3), 'ellipsis' as const, ...scaleArray.slice(-3)]
              : scaleArray;

            const ScaleIcon = ({ value }: { value: number }) => {
              switch (scaleType) {
                case 'stars':
                  return <Star className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />;
                case 'numbers':
                  return (
                    <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">{value}</span>
                    </div>
                  );
                case 'emoji': {
                  const emojiMap = ['😞', '😕', '😐', '🙂', '😊', '😄', '🤩', '🥳', '🤩', '🎉'];
                  const emojiIndex = Math.min(Math.floor((value - min) / scaleLength * 9), 9);
                  return <span className="text-2xl">{emojiMap[emojiIndex]}</span>;
                }
              }
            };

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1 opacity-50">
                  {displayArray.map((value, idx) => {
                    if (value === 'ellipsis') {
                      return (
                        <div key="ellipsis" className="flex flex-col items-center gap-1 px-1">
                          <div className="h-6 w-6 flex items-center justify-center">
                            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                          </div>
                          {scaleType !== 'numbers' && (
                            <span className="text-xs text-muted-foreground invisible">•</span>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div key={value} className="flex flex-col items-center gap-1">
                        <ScaleIcon value={value as number} />
                        {scaleType !== 'numbers' && (
                          <span className="text-xs text-muted-foreground">{value}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {(minLabel || maxLabel) && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground opacity-50">
                    <span>{minLabel || ''}</span>
                    <span>{maxLabel || ''}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {question.type === 'email' && (() => {
            const settings = question.settings as EmailSettings;
            const placeholder = settings?.placeholder || 'email@example.com';

            return (
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input
                    placeholder={placeholder}
                    disabled
                    className="opacity-50 border-border/50 pl-10"
                  />
                </div>
              </div>
            );
          })()}

          {question.type === 'phone' && (() => {
            const settings = question.settings as PhoneSettings;
            const defaultCountry = settings?.defaultCountry || 'us';
            const countryFlags: Record<string, string> = {
              us: '🇺🇸', gb: '🇬🇧', ca: '🇨🇦', au: '🇦🇺', de: '🇩🇪',
              fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹', no: '🇳🇴', se: '🇸🇪',
              dk: '🇩🇰', nl: '🇳🇱', be: '🇧🇪', ch: '🇨🇭', at: '🇦🇹',
              pl: '🇵🇱', jp: '🇯🇵', kr: '🇰🇷', cn: '🇨🇳', in: '🇮🇳',
              br: '🇧🇷', mx: '🇲🇽'
            };
            const flag = countryFlags[defaultCountry] || '🌍';

            return (
              <div className="relative flex gap-2">
                <div className="flex items-center gap-1 px-3 py-2 border border-border/50 rounded-lg bg-white/50 dark:bg-white/5 opacity-50">
                  <span className="text-lg">{flag}</span>
                </div>
                <Input
                  placeholder="Phone number"
                  disabled
                  className="opacity-50 border-border/50 flex-1"
                />
              </div>
            );
          })()}

          {question.type === 'date' && (() => {
            const settings = question.settings as DateSettings;
            const format = settings?.format || 'MM/DD/YYYY';
            const disablePast = settings?.disablePast || false;
            const disableFuture = settings?.disableFuture || false;
            const minDate = settings?.minDate;
            const maxDate = settings?.maxDate;

            const constraints = [];
            if (disablePast) constraints.push('No past dates');
            if (disableFuture) constraints.push('No future dates');
            if (minDate) constraints.push(`From ${minDate}`);
            if (maxDate) constraints.push(`Until ${maxDate}`);

            return (
              <div className="space-y-2">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input
                    placeholder={format}
                    disabled
                    className="opacity-50 border-border/50 pl-10"
                  />
                </div>

                {constraints.length > 0 && (
                  <div className="text-xs text-muted-foreground opacity-50 pl-1">
                    {constraints.join(' • ')}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Logic Summary Section */}
        <LogicSummary
          key={`logic-summary-${question.id}-${questionsPositionKey}`}
          logic={logic || { rules: [], default_action: 'next' }}
          allQuestions={allQuestions}
          currentQuestion={question}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this question. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
