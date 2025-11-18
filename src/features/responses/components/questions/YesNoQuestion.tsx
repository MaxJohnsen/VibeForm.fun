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

  useEffect(() => {
    const isValid = value !== null;
    onValidationChange(isValid);
    if (isValid) {
      onSubmit(value);
    }
  }, [value, onValidationChange, onSubmit]);

  const handleSelect = (selected: boolean) => {
    if (value === selected) return; // Prevent re-submitting same value
    setValue(selected);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <h2 className="text-4xl md:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <div className="flex gap-4 max-w-md mx-auto">
        <button
          onClick={() => handleSelect(true)}
          className={`flex-1 p-8 rounded-2xl border-2 transition-all ${
            value === true
              ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <Check className={`h-8 w-8 ${value === true ? 'text-primary-foreground' : 'text-primary'}`} />
            <span className="text-xl font-medium">{yesLabel}</span>
          </div>
        </button>

        <button
          onClick={() => handleSelect(false)}
          className={`flex-1 p-8 rounded-2xl border-2 transition-all ${
            value === false
              ? 'border-destructive bg-destructive text-destructive-foreground shadow-lg scale-105'
              : 'border-border hover:border-destructive/50 hover:bg-muted/50'
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <X className={`h-8 w-8 ${value === false ? 'text-destructive-foreground' : 'text-destructive'}`} />
            <span className="text-xl font-medium">{noLabel}</span>
          </div>
        </button>
      </div>
    </div>
  );
};
