import { QuestionCard } from './QuestionCard';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Question } from '../api/questionsApi';
import { FileQuestion } from 'lucide-react';

interface QuestionCanvasProps {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
}

export const QuestionCanvas = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onDeleteQuestion,
}: QuestionCanvasProps) => {
  if (questions.length === 0) {
    return (
      <div className="flex-1 p-8 overflow-y-auto">
        <EmptyState
          icon={FileQuestion}
          title="No questions yet"
          description="Click on a question type from the left panel to add your first question"
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            isSelected={selectedQuestionId === question.id}
            onSelect={() => onSelectQuestion(question.id)}
            onDelete={() => onDeleteQuestion(question.id)}
          />
        ))}
      </div>
    </div>
  );
};
