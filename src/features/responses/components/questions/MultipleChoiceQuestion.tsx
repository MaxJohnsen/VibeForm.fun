import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MultipleChoiceQuestionProps {
  label: string;
  settings: any;
  initialValue?: any;
  onSubmit: (value: any) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const MultipleChoiceQuestion = ({
  label,
  settings,
  initialValue,
  onSubmit,
  onValidationChange,
}: MultipleChoiceQuestionProps) => {
  const allowMultiple = settings?.allowMultiple || false;
  const allowOther = settings?.allowOther || false;
  const options = settings?.options || [];

  const [selectedValues, setSelectedValues] = useState<string[]>(
    initialValue ? (Array.isArray(initialValue) ? initialValue : [initialValue]) : []
  );
  const [otherValue, setOtherValue] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);

  useEffect(() => {
    const hasSelection = selectedValues.length > 0 || (showOtherInput && otherValue.trim().length > 0);
    onValidationChange(hasSelection);
  }, [selectedValues, otherValue, showOtherInput, onValidationChange]);

  const handleOptionClick = (optionId: string) => {
    if (allowMultiple) {
      setSelectedValues(prev =>
        prev.includes(optionId)
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      if (selectedValues[0] === optionId) return; // Prevent re-submitting same value
      setSelectedValues([optionId]);
      onSubmit(optionId);
    }
  };

  const handleOtherClick = () => {
    setShowOtherInput(true);
    if (!allowMultiple) {
      setSelectedValues(['other']);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (selectedValues.length > 0 || (showOtherInput && otherValue.trim()))) {
      const finalValue = showOtherInput && otherValue.trim()
        ? allowMultiple
          ? [...selectedValues, otherValue]
          : otherValue
        : allowMultiple
        ? selectedValues
        : selectedValues[0];
      onSubmit(finalValue);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" onKeyPress={handleKeyPress}>
      <h2 className="text-4xl md:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <div className="space-y-3">
        {allowMultiple ? (
          options.map((option: any) => {
            const optionId = option.id || option.text;
            const isSelected = selectedValues.includes(optionId);
            
            return (
              <div
                key={optionId}
                onClick={() => handleOptionClick(optionId)}
                className={`flex items-center gap-4 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  checked={isSelected}
                  className="pointer-events-none"
                />
                <Label className="text-lg cursor-pointer flex-1">
                  {option.text}
                </Label>
              </div>
            );
          })
        ) : (
          <RadioGroup value={selectedValues[0]} onValueChange={handleOptionClick}>
            {options.map((option: any) => {
              const optionId = option.id || option.text;
              const isSelected = selectedValues[0] === optionId;

              return (
                <div
                  key={optionId}
                  onClick={() => handleOptionClick(optionId)}
                  className={`flex items-center gap-4 p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value={optionId} className="pointer-events-none" />
                  <Label className="text-lg cursor-pointer flex-1">
                    {option.text}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        )}

        {allowOther && (
          showOtherInput ? (
            <div className="p-5 rounded-lg border-2 border-primary bg-primary/5">
              <Input
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder="Please specify..."
                autoFocus
                className="border-0 bg-transparent focus-visible:ring-0 text-lg"
              />
            </div>
          ) : (
            <div
              onClick={handleOtherClick}
              className="flex items-center gap-4 p-5 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all"
            >
              <div className="w-5 h-5 rounded-full border-2 border-border" />
              <span className="text-lg text-muted-foreground">Other</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};
