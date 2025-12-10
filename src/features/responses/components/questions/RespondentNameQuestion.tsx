import { useState, useEffect } from 'react';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';
import { RespondentInput } from './RespondentInput';

interface RespondentNameQuestionProps {
  label: string;
  description?: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  formLanguage?: SupportedLanguage;
}

export const RespondentNameQuestion = ({
  label,
  description,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
  formLanguage = 'en',
}: RespondentNameQuestionProps) => {
  const getInitialValue = () => {
    if (!initialValue) return '';
    if (typeof initialValue === 'object') return ''; // Handle _skipped objects
    return String(initialValue);
  };
  const [value, setValue] = useState(getInitialValue());
  const isRequired = settings?.required === true;
  const placeholder = settings?.placeholder || 'Enter your name...';
  const t = useQuestionTranslation(formLanguage);

  useEffect(() => {
    const isValid = !isRequired || value.trim().length > 0;
    onValidationChange(isValid);
    if (isValid) {
      onSubmit(value);
    }
  }, [value, isRequired, onValidationChange, onSubmit]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      if (window.innerWidth < 768) {
        (e.target as HTMLInputElement).blur();
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

      <RespondentInput
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        autoFocus
      />
    </div>
  );
};
