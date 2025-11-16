import { Badge } from '@/components/ui/badge';
import { TextInput } from '@/shared/ui/TextInput';
import { Question } from '../api/questionsApi';
import { QUESTION_TYPES } from '@/shared/constants/questionTypes';
import { Settings } from 'lucide-react';

interface PropertiesPanelProps {
  question: Question | null;
  onUpdateLabel: (label: string) => void;
}

export const PropertiesPanel = ({ question, onUpdateLabel }: PropertiesPanelProps) => {
  if (!question) {
    return (
      <div className="w-80 border-l border-border/50 glass-panel p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Select a question</h3>
          <p className="text-sm text-muted-foreground">
            Click on any question to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const questionType = QUESTION_TYPES.find((t) => t.type === question.type);

  return (
    <div className="w-80 border-l border-border/50 glass-panel p-6 overflow-y-auto">
      <h2 className="font-semibold mb-6">Question Properties</h2>

      <div className="space-y-6">
        {/* Question Type */}
        <div>
          <label className="text-sm font-medium text-muted-foreground block mb-2">
            Question Type
          </label>
          <Badge variant="secondary" className="text-sm">
            {questionType?.label}
          </Badge>
        </div>

        {/* Question Label */}
        <TextInput
          label="Question Text"
          value={question.label}
          onChange={(e) => onUpdateLabel(e.target.value)}
          placeholder="Enter your question..."
        />

        {/* Future settings would go here */}
      </div>
    </div>
  );
};
