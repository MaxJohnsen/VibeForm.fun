import { useState, useEffect } from 'react';
import { validateEmail } from '@/shared/utils/questionValidation';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmailQuestionProps {
  label: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const EmailQuestion = ({
  label,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
}: EmailQuestionProps) => {
  const [value, setValue] = useState(initialValue ?? '');
  const [error, setError] = useState('');
  const isMobile = useIsMobile();
  const placeholder = settings?.placeholder || 'name@example.com';
  const isRequired = settings?.required !== false;

  useEffect(() => {
    if (!value) {
      setError('');
      onValidationChange(!isRequired);
      if (!isRequired) {
        onSubmit('');
      }
      return;
    }

    const isValid = validateEmail(value);
    setError(isValid ? '' : 'Please enter a valid email address');
    onValidationChange(isValid);
    if (isValid) {
      onSubmit(value);
    }
  }, [value, isRequired, onValidationChange, onSubmit]);

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
        <input
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoFocus
          className={`w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg bg-white/50 dark:bg-white/5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
            error ? 'border-destructive focus:border-destructive' : 'border-border/50 focus:border-primary'
          }`}
        />
        {error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    </div>
  );
};
