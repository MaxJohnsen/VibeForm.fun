import { FileQuestion } from 'lucide-react';
import { Question } from '../types/builder.types';
import { QuestionItem } from './QuestionItem';
import { EmptyState } from '@/shared/ui';

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
      <div className="glass-panel rounded-xl p-8 flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={<FileQuestion className="w-16 h-16" />}
          title="No questions yet"
          description="Add questions from the palette on the left to get started"
        />
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-6">
      <div className="space-y-3">
        {questions.map((question) => (
          <QuestionItem
            key={question.id}
            question={question}
            isSelected={selectedQuestionId === question.id}
            onSelect={() => onSelectQuestion(question.id)}
            onDelete={() => onDeleteQuestion(question.id)}
          />
        ))}
      </div>
    </div>
  );
};
