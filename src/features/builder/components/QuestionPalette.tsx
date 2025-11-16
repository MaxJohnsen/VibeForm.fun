import { Type, TextCursor } from 'lucide-react';
import { QuestionTypeButton } from './QuestionTypeButton';
import { QuestionType, QuestionTypeConfig } from '../types/builder.types';

interface QuestionPaletteProps {
  onAddQuestion: (type: QuestionType) => void;
}

const questionTypes: QuestionTypeConfig[] = [
  {
    type: 'short_text',
    label: 'Short Text',
    icon: TextCursor,
    description: 'Single line of text',
  },
  {
    type: 'long_text',
    label: 'Long Text',
    icon: Type,
    description: 'Multiple lines of text',
  },
];

export const QuestionPalette = ({ onAddQuestion }: QuestionPaletteProps) => {
  return (
    <div className="w-64 glass-panel rounded-xl p-4 h-fit sticky top-4">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Question Types
      </h3>
      <div className="space-y-2">
        {questionTypes.map((config) => (
          <QuestionTypeButton
            key={config.type}
            config={config}
            onClick={() => onAddQuestion(config.type)}
          />
        ))}
      </div>
    </div>
  );
};
