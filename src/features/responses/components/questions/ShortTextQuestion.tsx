import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';
import { QuestionWrapper } from './QuestionWrapper';
import { RespondentInput } from './RespondentInput';

interface ShortTextQuestionProps {
  label: string;
  description?: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  formLanguage?: SupportedLanguage;
}

export const ShortTextQuestion = ({
  label,
  description,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
  formLanguage = 'en',
}: ShortTextQuestionProps) => {
  const getInitialValue = () => {
    if (!initialValue) return '';
    if (typeof initialValue === 'object') return ''; // Handle _skipped objects
    return String(initialValue);
  };
  const [value, setValue] = useState(getInitialValue());
  const isMobile = useIsMobile();
  const isRequired = settings?.required === true;
  const placeholder = settings?.placeholder || 'Type your answer here...';
  const maxLength = settings?.maxLength;
  const t = useQuestionTranslation(formLanguage);

  useEffect(() => {
    const isValid = !isRequired || value.trim().length > 0;
    onValidationChange(isValid);
    if (isValid) {
      onSubmit(value);
    }
  }, [value, isRequired, onValidationChange, onSubmit]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (isMobile) {
        e.currentTarget.blur();
      } else {
        if (value.trim()) {
          onSubmit(value);
        }
      }
    }
  };

  return (
    <QuestionWrapper>
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
        maxLength={maxLength}
        autoFocus
      />

      {maxLength && (
        <p className="text-sm text-muted-foreground">
          {value.length} / {maxLength}
        </p>
      )}
    </QuestionWrapper>
  );
};
