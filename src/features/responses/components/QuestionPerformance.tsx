import { cn } from '@/lib/utils';
import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { Star } from 'lucide-react';

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
    
    const answers = responses
      .flatMap(r => r.answers)
      .filter(a => a.question_id === question.id);
    
    let visual: React.ReactNode = null;
    let metric = '';
    let details = '';
    
    switch (question.type) {
      case 'rating':
        const ratingValues = answers
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
        details = ratingValues.length > 0 ? `Based on ${ratingValues.length} ratings` : '';
        break;
        
      case 'yes_no':
        const yesCount = answers.filter(a => a.answer_value === true).length;
        const noCount = answers.filter(a => a.answer_value === false).length;
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
        if (answers.length > 0) {
          const valueCounts = new Map<string, number>();
          answers.forEach(a => {
            const value = String(a.answer_value);
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
          });
          const sortedChoices = Array.from(valueCounts.entries())
            .sort((a, b) => b[1] - a[1]);
          const mostCommon = sortedChoices[0];
          const percentage = Math.round((mostCommon[1] / answers.length) * 100);
          
          visual = (
            <div className="space-y-1">
              {sortedChoices.slice(0, 3).map(([choice, count]) => {
                const pct = (count / answers.length) * 100;
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
        metric = `${answers.length} ${answers.length === 1 ? 'response' : 'responses'}`;
        details = answers.length > 0 ? 'View individual responses for details' : 'No responses yet';
        break;
    }
    
    return { visual, metric, details, dropoffRate, reachedCount, droppedOffCount };
  };
  
  const getQuestionIcon = (type: string) => {
    const questionType = QUESTION_TYPES.find(qt => qt.type === type);
    return questionType?.icon;
  };

  return (
    <div className="glass-panel rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Question Performance</h3>
      <div className="space-y-6">
        {questions.map((question) => {
          const { visual, metric, details, dropoffRate, reachedCount, droppedOffCount } = getQuestionMetrics(question);
          const Icon = getQuestionIcon(question.type);
          
          // Color coding for drop-off rate (inverted: low is good)
          const dropoffColor = dropoffRate < 10 
            ? 'text-green-600 dark:text-green-400' 
            : dropoffRate < 25 
            ? 'text-yellow-600 dark:text-yellow-400' 
            : 'text-red-600 dark:text-red-400';
          
          const questionType = QUESTION_TYPES.find(qt => qt.type === question.type);
          
          return (
            <div key={question.id} className="space-y-3 pb-6 border-b border-border/50 last:border-0 last:pb-0">
              <div className="flex items-start gap-3">
                {Icon && (
                  <div className={cn("rounded-lg p-2 shrink-0", questionType?.colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="text-sm font-medium">
                      Q{question.position}. {question.label}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <div className={cn('text-sm font-medium whitespace-nowrap', dropoffColor)}>
                        {dropoffRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        drop-off
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <div className="text-lg font-semibold">
                        {metric}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {details}
                      </div>
                    </div>
                    
                    {visual && (
                      <div className="mt-2">
                        {visual}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
