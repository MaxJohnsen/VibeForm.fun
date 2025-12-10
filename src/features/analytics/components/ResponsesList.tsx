import { ResponseWithAnswers } from '../api/analyticsApi';
import { ResponseItem } from './ResponseItem';
import { EmptyState, ContentCard } from '@/shared/ui';
import { FileQuestion } from 'lucide-react';

interface ResponsesListProps {
  responses: ResponseWithAnswers[];
  totalQuestions: number;
  questions: Array<{ id: string; type: string; label: string }>;
}

export const ResponsesList = ({ responses, totalQuestions, questions }: ResponsesListProps) => {
  if (responses.length === 0) {
    return (
      <ContentCard padding="lg" rounded="xl">
        <EmptyState
          icon={FileQuestion}
          title="No responses yet"
          description="Share your form to start collecting responses. They'll appear here in real-time."
        />
      </ContentCard>
    );
  }

  return (
    <ContentCard title="Responses" padding="md" rounded="xl">
      <div className="space-y-0">
        {responses.map((response) => (
          <div key={response.id} className="py-3 border-b border-border/50 last:border-0 last:pb-0 first:pt-0">
            <ResponseItem
              response={response}
              totalQuestions={totalQuestions}
              questions={questions}
            />
          </div>
        ))}
      </div>
    </ContentCard>
  );
};
