import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface ShortTextQuestionProps {
  label: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const ShortTextQuestion = ({
  label,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
}: ShortTextQuestionProps) => {
  const [value, setValue] = useState(initialValue);
  const isRequired = settings?.required !== false;
  const placeholder = settings?.placeholder || 'Type your answer here...';
  const maxLength = settings?.maxLength;

  useEffect(() => {
    const isValid = !isRequired || value.trim().length > 0;
    onValidationChange(isValid);
  }, [value, isRequired, onValidationChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(value);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-4xl md:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus
        className="text-xl py-6 border-b border-t-0 border-x-0 rounded-none focus-visible:ring-0 focus-visible:border-primary transition-colors"
      />

      {maxLength && (
        <p className="text-sm text-muted-foreground">
          {value.length} / {maxLength}
        </p>
      )}
    </div>
  );
};
