import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuestionPerformanceProps {
  questions: Array<{
    id: string;
    label: string;
    type: string;
    position: number;
  }>;
  responses: Array<{
    answers: Array<{
      question_id: string;
      answer_value: any;
    }>;
  }>;
}

export const QuestionPerformance = ({ questions, responses }: QuestionPerformanceProps) => {
  const totalResponses = responses.length;

  const getQuestionMetrics = (question: any) => {
    const answers = responses
      .flatMap(r => r.answers)
      .filter(a => a.question_id === question.id);
    
    const answerCount = answers.length;
    const completionRate = totalResponses > 0 ? (answerCount / totalResponses) * 100 : 0;
    
    let metric = '';
    let details = '';
    
    switch (question.type) {
      case 'rating':
        const ratingValues = answers
          .map(a => Number(a.answer_value))
          .filter(v => !isNaN(v));
        const avgRating = ratingValues.length > 0
          ? (ratingValues.reduce((sum, v) => sum + v, 0) / ratingValues.length).toFixed(1)
          : '0';
        metric = `${avgRating}/5`;
        details = `${ratingValues.length} ratings`;
        break;
        
      case 'yes_no':
        const yesCount = answers.filter(a => a.answer_value === true).length;
        const noCount = answers.filter(a => a.answer_value === false).length;
        const yesPercent = answerCount > 0 ? Math.round((yesCount / answerCount) * 100) : 0;
        metric = `${yesPercent}% Yes`;
        details = `${yesCount} Yes, ${noCount} No`;
        break;
        
      case 'multiple_choice':
        if (answerCount > 0) {
          const valueCounts = new Map<string, number>();
          answers.forEach(a => {
            const value = String(a.answer_value);
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
          });
          const mostCommon = Array.from(valueCounts.entries())
            .sort((a, b) => b[1] - a[1])[0];
          metric = mostCommon[0].substring(0, 30);
          details = `${mostCommon[1]} selected (${Math.round((mostCommon[1] / answerCount) * 100)}%)`;
        } else {
          metric = 'No responses';
          details = '';
        }
        break;
        
      default: // text types (short_text, long_text, email, phone, date)
        metric = `${answerCount} responses`;
        details = answerCount > 0 ? 'View responses to see details' : '';
        break;
    }
    
    return { metric, details, completionRate, answerCount };
  };

  return (
    <div className="glass-panel rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4">Question Performance</h3>
      <div className="space-y-4">
        {questions.map((question) => {
          const { metric, details, completionRate, answerCount } = getQuestionMetrics(question);
          const color = completionRate > 80 ? 'text-green-600' : completionRate > 60 ? 'text-yellow-600' : 'text-red-600';
          
          return (
            <div key={question.id} className="space-y-2 pb-4 border-b border-border/50 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-1">
                    Q{question.position}. {question.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {metric}
                  </div>
                  {details && (
                    <div className="text-xs text-muted-foreground/70 mt-1">
                      {details}
                    </div>
                  )}
                </div>
                <div className={cn('text-sm font-medium whitespace-nowrap', color)}>
                  {completionRate.toFixed(0)}%
                </div>
              </div>
              
              <Progress 
                value={completionRate} 
                className="h-2"
              />
              
              <div className="text-xs text-muted-foreground">
                {answerCount} of {totalResponses} responded
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
