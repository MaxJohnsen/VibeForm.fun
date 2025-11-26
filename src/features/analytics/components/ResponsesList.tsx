import { ResponseWithAnswers } from '../api/analyticsApi';
import { ResponseItem } from './ResponseItem';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FileQuestion } from 'lucide-react';

interface ResponsesListProps {
  responses: ResponseWithAnswers[];
  totalQuestions: number;
  questions: Array<{ id: string; type: string; label: string }>;
}

export const ResponsesList = ({ responses, totalQuestions, questions }: ResponsesListProps) => {
  if (responses.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6 md:p-8">
        <EmptyState
          icon={FileQuestion}
          title="No responses yet"
          description="Share your form to start collecting responses. They'll appear here in real-time."
        />
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-3 md:mb-4">Recent Responses</h3>
      <div className="space-y-0">
        {responses.slice(0, 10).map((response) => (
          <div key={response.id} className="py-3 border-b border-border/50 last:border-0 last:pb-0 first:pt-0">
            <ResponseItem
              response={response}
              totalQuestions={totalQuestions}
              questions={questions}
            />
          </div>
        ))}
      </div>
      {responses.length > 10 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Showing 10 of {responses.length} responses
        </p>
      )}
    </div>
  );
};
