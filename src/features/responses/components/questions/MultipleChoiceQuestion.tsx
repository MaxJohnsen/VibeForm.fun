import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Check } from 'lucide-react';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';

interface MultipleChoiceQuestionProps {
  label: string;
  settings: any;
  initialValue?: any;
  onSubmit: (value: any) => void;
  onValidationChange: (isValid: boolean) => void;
  formLanguage?: SupportedLanguage;
}

export const MultipleChoiceQuestion = ({
  label,
  settings,
  initialValue,
  onSubmit,
  onValidationChange,
  formLanguage = 'en',
}: MultipleChoiceQuestionProps) => {
  const allowMultiple = settings?.allowMultiple || false;
  const allowOther = settings?.allowOther || false;
  const options = settings?.options || [];
  const isRequired = settings?.required !== false;
  const t = useQuestionTranslation(formLanguage);

  // Parse initialValue to detect "Other" values
  const parseInitialValue = () => {
    if (!initialValue) return { selected: [], other: '', showOther: false };
    
    const optionTexts = options.map((opt: any) => opt.text);
    const values = Array.isArray(initialValue) ? initialValue : [initialValue];
    
    // Separate predefined options from "Other" values
    const selected: string[] = [];
    let other = '';
    
    values.forEach(val => {
      if (optionTexts.includes(val)) {
        selected.push(val);
      } else if (allowOther) {
        // This is a custom "Other" value
        other = val;
      }
    });
    
    return { 
      selected, 
      other, 
      showOther: other.length > 0 
    };
  };

  const initialParsed = parseInitialValue();

  const [selectedValues, setSelectedValues] = useState<string[]>(initialParsed.selected);
  const [otherValue, setOtherValue] = useState(initialParsed.other);
  const [showOtherInput, setShowOtherInput] = useState(initialParsed.showOther);

  // Prevent auto-focus on mobile after navigation
  useEffect(() => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.blur());
  }, []);

  useEffect(() => {
    const hasSelection = selectedValues.length > 0 || (showOtherInput && otherValue.trim().length > 0);
    const isValid = !isRequired || hasSelection;
    onValidationChange(isValid);
    
    // Submit current value to parent
    if (hasSelection) {
      const finalValue = showOtherInput && otherValue.trim()
        ? allowMultiple
          ? [...selectedValues, otherValue]
          : otherValue
        : allowMultiple
        ? selectedValues
        : selectedValues[0];
      onSubmit(finalValue);
    }
  }, [selectedValues, otherValue, showOtherInput, isRequired, onValidationChange, allowMultiple, onSubmit]);

  const handleOptionClick = (optionId: string) => {
    if (allowMultiple) {
      setSelectedValues(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Toggle off if clicking the same option in single-select mode
      if (selectedValues[0] === optionId) {
        setSelectedValues([]);
      } else {
        setSelectedValues([optionId]);
      }
    }
  };

  const handleOtherClick = () => {
    setShowOtherInput(true);
    if (!allowMultiple) {
      setSelectedValues(['other']);
    }
  };

  const handleOtherDeselect = () => {
    setShowOtherInput(false);
    setOtherValue('');
    if (!allowMultiple) {
      setSelectedValues([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Enter key handling is now managed by parent RespondentPage
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in" onKeyPress={handleKeyPress}>
      <QuestionLabel 
        label={label} 
        isRequired={isRequired} 
        optionalText={t.optional} 
      />

      <div className="space-y-3 sm:space-y-4">
        {allowMultiple ? (
          options.map((option: any) => {
            const optionValue = option.text;
            const isSelected = selectedValues.includes(optionValue);
            
            return (
              <div
                key={optionValue}
                onClick={() => handleOptionClick(optionValue)}
                className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg border-2 cursor-pointer transition-all min-h-[56px] ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className={`w-4 h-4 shrink-0 rounded-[3px] border-2 flex items-center justify-center transition-all ${
                  isSelected 
                    ? 'bg-primary border-primary' 
                    : 'border-muted-foreground/30'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                </div>
                <Label className="text-base sm:text-lg cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            );
          })
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {options.map((option: any) => {
              const optionValue = option.text;
              const isSelected = selectedValues[0] === optionValue;

              return (
                <div
                  key={optionValue}
                  onClick={() => handleOptionClick(optionValue)}
                  className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg border-2 cursor-pointer transition-all min-h-[56px] ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <div className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'border-primary' 
                      : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <Label className="text-base sm:text-lg cursor-pointer flex-1">
                    {option.text}
                  </Label>
                </div>
              );
            })}
          </div>
        )}

        {allowOther && (
          showOtherInput ? (
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg border-2 border-primary bg-primary/5 transition-all min-h-[56px]">
              <div onClick={handleOtherDeselect} className="cursor-pointer flex-shrink-0">
                {allowMultiple ? (
                  <div className="w-4 h-4 shrink-0 rounded-[3px] border-2 bg-primary border-primary flex items-center justify-center transition-all">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="w-4 h-4 shrink-0 rounded-full border-2 border-primary flex items-center justify-center transition-all">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
              </div>
              <span className="text-base sm:text-lg text-muted-foreground shrink-0">{t.other}:</span>
              <Input
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder={t.pleaseSpecify}
                autoFocus
                className="flex-1 border-0 bg-white/50 rounded-md px-3 py-1 focus-visible:ring-0 text-base sm:text-lg"
              />
              <button
                onClick={handleOtherDeselect}
                className="flex-shrink-0 p-1 hover:bg-primary/10 rounded transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ) : (
            <div
              onClick={handleOtherClick}
              className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all min-h-[56px]"
            >
              <div className={`w-4 h-4 border-2 border-muted-foreground/30 flex-shrink-0 ${allowMultiple ? 'rounded-[3px]' : 'rounded-full'}`} />
              <span className="text-base sm:text-lg text-muted-foreground">{t.other}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};
