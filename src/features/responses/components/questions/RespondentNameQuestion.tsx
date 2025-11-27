import { useState, useEffect } from 'react';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';

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
  const [value, setValue] = useState(initialValue ?? '');
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
      // Blur on mobile to dismiss keyboard, submit on desktop
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

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        autoFocus
        className="w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg bg-white/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  );
};
