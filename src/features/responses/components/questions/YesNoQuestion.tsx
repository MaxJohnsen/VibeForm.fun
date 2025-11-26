import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface YesNoQuestionProps {
  label: string;
  settings: any;
  initialValue?: boolean;
  onSubmit: (value: boolean) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const YesNoQuestion = ({
  label,
  settings,
  initialValue,
  onSubmit,
  onValidationChange,
}: YesNoQuestionProps) => {
  const [value, setValue] = useState<boolean | null>(initialValue ?? null);
  const yesLabel = settings?.yesLabel || 'Yes';
  const noLabel = settings?.noLabel || 'No';
  const isRequired = settings?.required !== false;

  useEffect(() => {
    const isValid = !isRequired || value !== null;
    onValidationChange(isValid);
    // Always notify parent of current value (including null for deselection)
    onSubmit(value);
  }, [value, isRequired, onValidationChange, onSubmit]);

  const handleSelect = (selected: boolean) => {
    // Toggle off if clicking the same value
    if (value === selected) {
      setValue(null);
    } else {
      setValue(selected);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-center">
        {label}
      </h2>

      <div className="flex gap-3 sm:gap-4 max-w-md mx-auto">
        <button
          onClick={() => handleSelect(true)}
          className={`flex-1 p-6 sm:p-8 rounded-2xl border-2 transition-[transform,background-color,border-color,box-shadow] duration-200 min-h-[120px] mobile-transform ${
            value === true
              ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <Check className={`h-7 w-7 sm:h-8 sm:w-8 ${value === true ? 'text-primary-foreground' : 'text-primary'}`} />
            <span className="text-lg sm:text-xl font-medium">{yesLabel}</span>
          </div>
        </button>

        <button
          onClick={() => handleSelect(false)}
          className={`flex-1 p-6 sm:p-8 rounded-2xl border-2 transition-[transform,background-color,border-color,box-shadow] duration-200 min-h-[120px] mobile-transform ${
            value === false
              ? 'border-destructive bg-destructive text-destructive-foreground shadow-lg scale-105'
              : 'border-border hover:border-destructive/50 hover:bg-muted/50'
          }`}
        >
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <X className={`h-7 w-7 sm:h-8 sm:w-8 ${value === false ? 'text-destructive-foreground' : 'text-destructive'}`} />
            <span className="text-lg sm:text-xl font-medium">{noLabel}</span>
          </div>
        </button>
      </div>
    </div>
  );
};
