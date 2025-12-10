import { useState, useEffect } from 'react';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';
import { RespondentInput } from './RespondentInput';

interface LongTextQuestionProps {
  label: string;
  description?: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  formLanguage?: SupportedLanguage;
}

export const LongTextQuestion = ({
  label,
  description,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
  formLanguage = 'en',
}: LongTextQuestionProps) => {
  const getInitialValue = () => {
    if (!initialValue) return '';
    if (typeof initialValue === 'object') return ''; // Handle _skipped objects
    return String(initialValue);
  };
  const [value, setValue] = useState(getInitialValue());
  const isRequired = settings?.required === true;
  const placeholder = settings?.placeholder || 'Type your answer here...';
  const maxLength = settings?.maxLength;
  const t = useQuestionTranslation(formLanguage);

  useEffect(() => {
    const trimmedValue = value.trim();
    const hasContent = trimmedValue.length > 0;
    const isValid = !isRequired || hasContent;
    
    onValidationChange(isValid);
    
    if (hasContent) {
      onSubmit(value);
    } else if (!isRequired) {
      onSubmit('');
    }
  }, [value, isRequired, onValidationChange, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      const trimmedValue = value.trim();
      const hasContent = trimmedValue.length > 0;
      const isValid = !isRequired || hasContent;
      
      if (isValid) {
        onSubmit(value);
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
        variant="textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus
        rows={6}
      />

      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span className="hidden sm:inline">{t.ctrlEnterSubmit}</span>
        {maxLength && (
          <span className="ml-auto">
            {value.length} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
};
