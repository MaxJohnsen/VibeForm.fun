import { cn } from '@/lib/utils';
import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { Star } from 'lucide-react';

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
}

export const QuestionPerformance = ({ questions, responses }: QuestionPerformanceProps) => {
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
          const valueCounts = new Map<string, number>();
          actualAnswers.forEach(a => {
            const value = String(a.answer_value);
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
          });
          const sortedChoices = Array.from(valueCounts.entries())
            .sort((a, b) => b[1] - a[1]);
          const mostCommon = sortedChoices[0];
          const percentage = Math.round((mostCommon[1] / actualAnswers.length) * 100);
          
          visual = (
            <div className="space-y-1">
              {sortedChoices.slice(0, 3).map(([choice, count]) => {
                const pct = (count / actualAnswers.length) * 100;
                return (
                  <div key={choice} className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {Math.round(pct)}%
                    </span>
                  </div>
                );
              })}
            </div>
          );
          metric = mostCommon[0].length > 30 ? mostCommon[0].substring(0, 27) + '...' : mostCommon[0];
          details = `Most popular: ${percentage}% selected`;
        } else {
          metric = 'No responses yet';
          details = '';
        }
        break;
        
      default: // text types (short_text, long_text, email, phone, date)
        metric = `${actualAnswers.length} ${actualAnswers.length === 1 ? 'response' : 'responses'}`;
        details = actualAnswers.length > 0 
          ? `View individual responses for details`
          : 'No responses yet';
        break;
    }
    
    return { visual, metric, details, dropoffRate, reachedCount, droppedOffCount, skipRate, skippedCount };
  };
  
  const getQuestionIcon = (type: string) => {
    const questionType = QUESTION_TYPES.find(qt => qt.type === type);
    return questionType?.icon;
  };

  return (
    <div className="glass-panel rounded-xl p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-3 md:mb-4">Question Performance</h3>
      <div className="space-y-6">
        {questions.map((question) => {
          const { visual, metric, details, dropoffRate, reachedCount, droppedOffCount, skipRate, skippedCount } = getQuestionMetrics(question);
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
              
              {/* Mobile stats (inline below) */}
              <div className="sm:hidden mt-2 flex items-center gap-1 text-xs flex-wrap ml-0">
                <span className={cn('font-medium', dropoffColor)}>
                  {dropoffRate.toFixed(0)}% drop-off ({droppedOffCount})
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="font-medium text-muted-foreground">
                  {skipRate.toFixed(0)}% blank ({skippedCount})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
