import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { validatePhone } from '@/shared/utils/questionValidation';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [value, setValue] = useState(initialValue ?? '');
  const [error, setError] = useState('');
  const isMobile = useIsMobile();
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
    if (isValid) {
      onSubmit(value);
    }
  }, [value, onValidationChange, onSubmit]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (isMobile) {
        // On mobile: Just dismiss keyboard
        e.currentTarget.blur();
      } else {
        // On desktop: Submit if valid
        if (value && !error) {
          onSubmit(value);
        }
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
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
          className={`text-lg sm:text-xl py-4 sm:py-6 border-b border-t-0 border-x-0 rounded-none focus-visible:ring-0 transition-colors ${
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
