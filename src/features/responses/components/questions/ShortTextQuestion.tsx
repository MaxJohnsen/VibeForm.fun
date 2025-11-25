import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [value, setValue] = useState(initialValue ?? '');
  const isMobile = useIsMobile();
  const isRequired = settings?.required !== false;
  const placeholder = settings?.placeholder || 'Type your answer here...';
  const maxLength = settings?.maxLength;

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
        // On mobile: Just dismiss keyboard
        e.currentTarget.blur();
      } else {
        // On desktop: Submit if valid
        if (value.trim()) {
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

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus
        className="w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg bg-white/50 dark:bg-white/5 border border-border/50 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
      />

      {maxLength && (
        <p className="text-sm text-muted-foreground">
          {value.length} / {maxLength}
        </p>
      )}
    </div>
  );
};
