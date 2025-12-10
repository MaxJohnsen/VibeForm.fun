import { useState, useEffect } from 'react';
import { validateEmail } from '@/shared/utils/questionValidation';
import { useIsMobile } from '@/hooks/use-mobile';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';
import { RespondentInput } from './RespondentInput';

interface EmailQuestionProps {
  label: string;
  description?: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  formLanguage?: SupportedLanguage;
}

export const EmailQuestion = ({
  label,
  description,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
  formLanguage = 'en',
}: EmailQuestionProps) => {
  const getInitialValue = () => {
    if (!initialValue) return '';
    if (typeof initialValue === 'object') return ''; // Handle _skipped objects
    return String(initialValue);
  };
  const [value, setValue] = useState(getInitialValue());
  const [error, setError] = useState('');
  const isMobile = useIsMobile();
  const placeholder = settings?.placeholder || 'name@example.com';
  const isRequired = settings?.required === true;
  const t = useQuestionTranslation(formLanguage);

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
    setError(isValid ? '' : t.validEmail);
    onValidationChange(isValid);
    if (isValid) {
      onSubmit(value);
    }
  }, [value, isRequired, onValidationChange, onSubmit, t.validEmail]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (isMobile) {
        e.currentTarget.blur();
      } else {
        if (value && !error) {
          onSubmit(value);
        }
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <QuestionLabel 
        label={label}
        description={description}
        isRequired={isRequired} 
        optionalText={t.optional} 
      />

      <div className="space-y-2">
        <RespondentInput
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoFocus
          error={error}
        />
        {error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    </div>
  );
};
