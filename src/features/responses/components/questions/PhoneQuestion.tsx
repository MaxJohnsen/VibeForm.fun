import { useState, useEffect } from 'react';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { useIsMobile } from '@/hooks/use-mobile';

const phoneUtil = PhoneNumberUtil.getInstance();

interface PhoneQuestionProps {
  label: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const PhoneQuestion = ({
  label,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
}: PhoneQuestionProps) => {
  const [value, setValue] = useState(initialValue ?? '');
  const [error, setError] = useState('');
  const isMobile = useIsMobile();
  const defaultCountry = settings?.defaultCountry || 'us';
  const isRequired = settings?.required !== false;

  useEffect(() => {
    if (!value) {
      setError('');
      onValidationChange(!isRequired);
      if (!isRequired) {
        onSubmit('');
      }
      return;
    }

    try {
      const phoneNumber = phoneUtil.parseAndKeepRawInput(value);
      const isValid = phoneUtil.isValidNumber(phoneNumber);
      setError(isValid ? '' : 'Please enter a valid phone number');
      onValidationChange(isValid);
      if (isValid) {
        onSubmit(value);
      }
    } catch {
      setError('Please enter a valid phone number');
      onValidationChange(false);
    }
  }, [value, isRequired, onValidationChange, onSubmit]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <div className="space-y-2">
        <PhoneInput
          value={value}
          onChange={setValue}
          defaultCountry={defaultCountry}
          error={!!error}
          autoFocus
        />
        {error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    </div>
  );
};
