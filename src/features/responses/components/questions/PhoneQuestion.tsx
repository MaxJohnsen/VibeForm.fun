import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { validatePhone } from '@/shared/utils/questionValidation';

interface PhoneQuestionProps {
  label: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const PhoneQuestion = ({
  label,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
}: PhoneQuestionProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const placeholder = settings?.placeholder || '+1 (555) 000-0000';

  useEffect(() => {
    if (!value) {
      setError('');
      onValidationChange(false);
      return;
    }

    const isValid = validatePhone(value);
    setError(isValid ? '' : 'Please enter a valid phone number');
    onValidationChange(isValid);
  }, [value, onValidationChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value && !error) {
      onSubmit(value);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-4xl md:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <div className="space-y-2">
        <Input
          type="tel"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoFocus
          className={`text-xl py-6 border-b border-t-0 border-x-0 rounded-none focus-visible:ring-0 transition-colors ${
            error ? 'border-destructive focus-visible:border-destructive' : 'focus-visible:border-primary'
          }`}
        />
        {error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    </div>
  );
};
