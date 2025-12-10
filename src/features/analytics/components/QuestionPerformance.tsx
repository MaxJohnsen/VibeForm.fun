import { useState } from 'react';
import { cn } from '@/lib/utils';
import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Star, Download } from 'lucide-react';
import { formatAnswerValue } from '../utils/formatAnswerValue';
import { analyticsApi } from '../api/analyticsApi';
import { toast } from '@/hooks/use-toast';
import { ContentCard } from '@/shared/ui';

// Helper to detect skipped answers
const isSkippedAnswer = (value: any): boolean => {
  return value && typeof value === 'object' && value._skipped === true;
};

interface QuestionPerformanceProps {
  questions: Array<{
    id: string;
    label: string;
    type: string;
    position: number;
    settings?: any;
  }>;
  responses: Array<{
    status: string;
    answers: Array<{
      question_id: string;
      answer_value: any;
    }>;
  }>;
  formId?: string;
}

export const QuestionPerformance = ({ questions, responses, formId }: QuestionPerformanceProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleExportQuestion = async (questionId: string, questionLabel: string) => {
    if (!formId) return;
    
    try {
      setExportingId(questionId);
      const csvContent = await analyticsApi.exportQuestionToCSV(formId, questionId, questionLabel);
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `question_${questionLabel.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: 'Question responses downloaded as CSV.',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting the responses.',
        variant: 'destructive',
      });
    } finally {
      setExportingId(null);
    }
  };
  
  const getQuestionMetrics = (question: any) => {
    // Find all responses that reached this question (have an answer for it)
    const responsesWithAnswer = responses.filter(r => 
      r.answers.some(a => a.question_id === question.id)
    );
    const reachedCount = responsesWithAnswer.length;
    
    // Find responses that dropped off at this question (last answered & in_progress)
    const droppedOffCount = responsesWithAnswer.filter(r => {
      const lastAnswer = r.answers[r.answers.length - 1];
      return lastAnswer?.question_id === question.id && r.status === 'in_progress';
    }).length;
    
    const dropoffRate = reachedCount > 0 ? (droppedOffCount / reachedCount) * 100 : 0;
    
    // Get all answers for this question
    const allAnswers = responses
      .flatMap(r => r.answers)
      .filter(a => a.question_id === question.id);
    
    // Separate skipped from actual answers
    const skippedCount = allAnswers.filter(a => isSkippedAnswer(a.answer_value)).length;
    const actualAnswers = allAnswers.filter(a => !isSkippedAnswer(a.answer_value));
    const skipRate = allAnswers.length > 0 ? (skippedCount / allAnswers.length) * 100 : 0;
    
    let visual: React.ReactNode = null;
    let metric = '';
    let details = '';
    
    switch (question.type) {
      case 'rating':
        const ratingValues = actualAnswers
          .map(a => Number(a.answer_value))
          .filter(v => !isNaN(v));
        const maxScale = question.settings?.max || 10;
        const avgRating = ratingValues.length > 0
          ? ratingValues.reduce((sum, v) => sum + v, 0) / ratingValues.length
          : 0;
        
        // Normalize to 5-star scale for visualization
        const normalizedRating = (avgRating / maxScale) * 5;
        const fullStars = Math.floor(normalizedRating);
        const hasHalfStar = normalizedRating % 1 >= 0.5;
        
        visual = (
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < fullStars ? "fill-yellow-500" : 
                  i === fullStars && hasHalfStar ? "fill-yellow-500/50" : "fill-none"
                )}
                strokeWidth={1.5}
              />
            ))}
          </div>
        );
        metric = ratingValues.length > 0 ? `${avgRating.toFixed(1)}/${maxScale}` : `No ratings (scale: 1-${maxScale})`;
        details = ratingValues.length > 0 
          ? `Based on ${ratingValues.length} rating${ratingValues.length > 1 ? 's' : ''}`
          : '';
        break;
        
      case 'yes_no':
        const yesCount = actualAnswers.filter(a => a.answer_value === true).length;
        const noCount = actualAnswers.filter(a => a.answer_value === false).length;
        const total = yesCount + noCount;
        const yesPercent = total > 0 ? (yesCount / total) * 100 : 0;
        
        visual = (
          <div className="flex gap-1 h-2 w-full rounded-full overflow-hidden bg-muted">
            <div 
              className="bg-emerald-500" 
              style={{ width: `${yesPercent}%` }}
            />
            <div 
              className="bg-red-500" 
              style={{ width: `${100 - yesPercent}%` }}
            />
          </div>
        );
        metric = `${Math.round(yesPercent)}% Yes`;
        details = `${yesCount} Yes, ${noCount} No`;
        break;
        
      case 'multiple_choice':
        if (actualAnswers.length > 0) {
          // Count selections per option (handling both single and multi-select)
          const optionCounts = new Map<string, number>();
          
          actualAnswers.forEach(a => {
            const values = Array.isArray(a.answer_value) 
              ? a.answer_value 
              : [a.answer_value];
            
            values.forEach(v => {
              const optionText = String(v);
              optionCounts.set(optionText, (optionCounts.get(optionText) || 0) + 1);
            });
          });
          
          // Sort by count descending
          const sortedOptions = Array.from(optionCounts.entries())
            .sort((a, b) => b[1] - a[1]);
          
          const totalResponses = actualAnswers.length;
          const mostPopular = sortedOptions[0];
          const mostPopularText = mostPopular[0];
          const mostPopularPct = Math.round((mostPopular[1] / totalResponses) * 100);
          
          visual = (
            <div className="space-y-2">
              {sortedOptions.slice(0, 4).map(([optionText, count]) => {
                const pct = (count / totalResponses) * 100;
                return (
                  <div key={optionText} className="flex items-center gap-3">
                    {/* Option label */}
                    <span className="text-xs text-muted-foreground w-24 truncate shrink-0">
                      {optionText}
                    </span>
                    {/* Progress bar */}
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Percentage and count */}
                    <span className="text-xs text-muted-foreground w-16 text-right shrink-0">
                      {Math.round(pct)}% ({count})
                    </span>
                  </div>
                );
              })}
            </div>
          );
          
          metric = '';
          details = '';
        } else {
          metric = 'No responses yet';
          details = '';
        }
        break;
        
      default: // text types (short_text, long_text, email, phone, date)
        metric = `${actualAnswers.length} ${actualAnswers.length === 1 ? 'response' : 'responses'}`;
        details = actualAnswers.length > 0 ? '' : 'No responses yet';
        break;
    }
    
    return { visual, metric, details, dropoffRate, reachedCount, droppedOffCount, skipRate, skippedCount, actualAnswers };
  };
  
  const getQuestionIcon = (type: string) => {
    const questionType = QUESTION_TYPES.find(qt => qt.type === type);
    return questionType?.icon;
  };

  return (
    <ContentCard title="Question Performance" padding="md" rounded="xl">
      <div className="space-y-6">
        {questions.map((question) => {
          const { visual, metric, details, dropoffRate, reachedCount, droppedOffCount, skipRate, skippedCount, actualAnswers } = getQuestionMetrics(question);
          const Icon = getQuestionIcon(question.type);
          
          // Color coding for drop-off rate (inverted: low is good)
          const dropoffColor = dropoffRate < 10 
            ? 'text-green-600 dark:text-green-400' 
            : dropoffRate < 25 
            ? 'text-yellow-600 dark:text-yellow-400' 
            : 'text-red-600 dark:text-red-400';
          
          const questionType = QUESTION_TYPES.find(qt => qt.type === question.type);
          
          return (
            <div key={question.id} className="pb-6 border-b border-border/50 last:border-0 last:pb-0">
              {actualAnswers.length > 0 ? (
                <Collapsible 
                  open={expandedId === question.id} 
                  onOpenChange={(open) => setExpandedId(open ? question.id : null)}
                >
                  {/* Clickable card trigger */}
                  <CollapsibleTrigger asChild>
                    <div className="cursor-pointer hover:bg-muted/30 -mx-2 px-2 py-3 rounded-lg transition-colors duration-200">
                      {/* Main row: flex with left content and right stats */}
                      <div className="flex items-start gap-4">
                        
                        {/* LEFT SIDE: Icon + Content */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Icon */}
                          {Icon && (
                            <div className={cn("rounded-lg p-2 shrink-0 hidden sm:block", questionType?.colorClass)}>
                              <Icon className="h-4 w-4" />
                            </div>
                          )}
                          
                          {/* Content stack: Question title, Metric, Visual */}
                          <div className="flex-1 min-w-0 space-y-2">
                            {/* Question title */}
                            <div className="text-sm font-medium break-words">
                              Q{question.position + 1}. {question.label}
                            </div>
                            
                            {/* Metric and details */}
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <div className="text-lg font-semibold">{metric}</div>
                              {details && (
                                <div className="text-xs text-muted-foreground">{details}</div>
                              )}
                            </div>
                            
                            {/* Visual */}
                            {visual && <div>{visual}</div>}
                          </div>
                        </div>
                        
                        {/* RIGHT SIDE: Stats column with chevron */}
                        <div className="hidden sm:flex flex-col items-end shrink-0 gap-1 min-w-[120px]">
                          {/* Drop-off */}
                          <div className="flex items-center gap-1">
                            <span className={cn('text-sm font-medium', dropoffColor)}>
                              {dropoffRate.toFixed(0)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              drop-off ({droppedOffCount})
                            </span>
                          </div>
                          
                          {/* Blank */}
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-muted-foreground">
                              {skipRate.toFixed(0)}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              blank ({skippedCount})
                            </span>
                          </div>
                          
                          {/* Chevron indicator */}
                          <div className="mt-1">
                            <ChevronDown className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200",
                              expandedId === question.id && "rotate-180"
                            )} />
                          </div>
                        </div>
                      </div>
                      
                      {/* Mobile stats with chevron */}
                      <div className="sm:hidden mt-2 flex items-center justify-between gap-2 text-xs flex-wrap">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={cn('font-medium', dropoffColor)}>
                            {dropoffRate.toFixed(0)}% drop-off ({droppedOffCount})
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium text-muted-foreground">
                            {skipRate.toFixed(0)}% blank ({skippedCount})
                          </span>
                        </div>
                        <ChevronDown className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          expandedId === question.id && "rotate-180"
                        )} />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  
                  {/* Expanded content */}
                  <CollapsibleContent>
                    <div className="mt-3 pt-3">
                      {/* Export link */}
                      {formId && (
                        <div className="flex justify-end mb-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportQuestion(question.id, question.label);
                            }}
                            disabled={exportingId === question.id}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <Download className="h-3 w-3" />
                            {exportingId === question.id ? 'Exporting...' : 'Export CSV'}
                          </button>
                        </div>
                      )}
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {actualAnswers.map((answer, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-md bg-muted/30"
                        >
                          <span className="text-muted-foreground text-xs w-8 shrink-0">#{idx + 1}</span>
                          <span className="flex-1 truncate">
                            {formatAnswerValue(answer.answer_value, question.type, question.settings)}
                          </span>
                        </div>
                      ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                // Non-clickable card when no responses
                <div className="-mx-2 px-2 py-3">
                  {/* Main row: flex with left content and right stats */}
                  <div className="flex items-start gap-4">
                    
                    {/* LEFT SIDE: Icon + Content */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Icon */}
                      {Icon && (
                        <div className={cn("rounded-lg p-2 shrink-0 hidden sm:block", questionType?.colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>
                      )}
                      
                      {/* Content stack: Question title, Metric, Visual */}
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Question title */}
                        <div className="text-sm font-medium break-words">
                          Q{question.position + 1}. {question.label}
                        </div>
                        
                        {/* Metric and details */}
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <div className="text-lg font-semibold">{metric}</div>
                          {details && (
                            <div className="text-xs text-muted-foreground">{details}</div>
                          )}
                        </div>
                        
                        {/* Visual */}
                        {visual && <div>{visual}</div>}
                      </div>
                    </div>
                    
                    {/* RIGHT SIDE: Stats column */}
                    <div className="hidden sm:flex flex-col items-end shrink-0 gap-1 min-w-[120px]">
                      {/* Drop-off */}
                      <div className="flex items-center gap-1">
                        <span className={cn('text-sm font-medium', dropoffColor)}>
                          {dropoffRate.toFixed(0)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          drop-off ({droppedOffCount})
                        </span>
                      </div>
                      
                      {/* Blank */}
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {skipRate.toFixed(0)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          blank ({skippedCount})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile stats */}
                  <div className="sm:hidden mt-2 flex items-center gap-1 text-xs flex-wrap">
                    <span className={cn('font-medium', dropoffColor)}>
                      {dropoffRate.toFixed(0)}% drop-off ({droppedOffCount})
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium text-muted-foreground">
                      {skipRate.toFixed(0)}% blank ({skippedCount})
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
