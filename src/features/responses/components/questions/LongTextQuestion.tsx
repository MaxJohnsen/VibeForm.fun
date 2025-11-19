import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface LongTextQuestionProps {
  label: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const LongTextQuestion = ({
  label,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
}: LongTextQuestionProps) => {
  const [value, setValue] = useState(initialValue ?? '');
  const isRequired = settings?.required !== false;
  const placeholder = settings?.placeholder || 'Type your answer here...';
  const maxLength = settings?.maxLength;

  useEffect(() => {
    const isValid = !isRequired || value.trim().length > 0;
    onValidationChange(isValid);
    if (isValid) {
      onSubmit(value);
    }
  }, [value, isRequired, onValidationChange, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && value.trim()) {
      onSubmit(value);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus
        rows={6}
        className="text-base sm:text-lg resize-none border-border focus-visible:border-primary transition-colors"
      />

      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span className="hidden sm:inline">Press Ctrl + Enter to submit</span>
        {maxLength && (
          <span className="ml-auto">
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
