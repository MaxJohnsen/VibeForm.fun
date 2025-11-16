import { Settings } from 'lucide-react';
import { Question } from '../types/builder.types';
import { TextInput } from '@/shared/ui/TextInput';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface PropertiesPanelProps {
  question: Question | null;
  onUpdateQuestion: (updates: Partial<Question>) => void;
}

export const PropertiesPanel = ({ 
  question, 
  onUpdateQuestion 
}: PropertiesPanelProps) => {
  if (!question) {
    return (
      <div className="w-80 glass-panel rounded-xl p-4 h-fit sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Properties
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select a question to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 glass-panel rounded-xl p-4 h-fit sticky top-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Properties
        </h3>
      </div>

      <div className="space-y-4">
        <TextInput
          label="Question Label"
          value={question.label}
          onChange={(e) => onUpdateQuestion({ label: e.target.value })}
          placeholder="Enter question text"
        />

        <TextInput
          label="Placeholder (optional)"
          value={question.placeholder || ''}
          onChange={(e) => onUpdateQuestion({ placeholder: e.target.value })}
          placeholder="e.g., Type your answer here..."
        />

        <div className="flex items-center justify-between">
          <Label htmlFor="required" className="text-sm font-medium">
            Required
          </Label>
          <Switch
            id="required"
            checked={question.is_required}
            onCheckedChange={(checked) => onUpdateQuestion({ is_required: checked })}
          />
        </div>
      </div>
    </div>
  );
};
