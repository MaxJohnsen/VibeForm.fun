import { useState, useEffect } from 'react';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';

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
  const [value, setValue] = useState(initialValue ?? '');
  const isRequired = settings?.required === true;
  const placeholder = settings?.placeholder || 'Type your answer here...';
  const maxLength = settings?.maxLength;
  const t = useQuestionTranslation(formLanguage);

  useEffect(() => {
    const trimmedValue = value.trim();
    const hasContent = trimmedValue.length > 0;
    const isValid = !isRequired || hasContent;
    
    onValidationChange(isValid);
    
    // Only update the answer when there's content (or for optional fields, always update)
    if (hasContent) {
      onSubmit(value);
    } else if (!isRequired) {
      // For optional fields, explicitly pass empty to indicate skipped
      onSubmit('');
    }
  }, [value, isRequired, onValidationChange, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Enter to submit (for long text)
    if (e.key === 'Enter' && e.ctrlKey) {
      const trimmedValue = value.trim();
      const hasContent = trimmedValue.length > 0;
      const isValid = !isRequired || hasContent;
      
      if (isValid) {
        onSubmit(value);
      }
    }
    // Regular Enter creates new line (default textarea behavior)
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <QuestionLabel 
        label={label}
        description={description}
        isRequired={isRequired} 
        optionalText={t.optional} 
      />

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus
        rows={6}
        className="w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg bg-white/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
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
