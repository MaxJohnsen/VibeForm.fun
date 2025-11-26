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
  const [touched, setTouched] = useState(false);
  const isMobile = useIsMobile();
  const defaultCountry = settings?.defaultCountry || 'us';
  const isRequired = settings?.required !== false;

  useEffect(() => {
    // Don't validate if not touched yet
    if (!touched) {
      onValidationChange(!isRequired);
      return;
    }

    if (!value) {
      setError('');
      onValidationChange(!isRequired);
      if (!isRequired) {
        onSubmit('');
      }
      return;
    }

    // Only validate if there are actual digits beyond the dial code
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 4) {
      setError('');
      onValidationChange(false);
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
  }, [value, isRequired, touched, onValidationChange, onSubmit]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (!touched) {
      setTouched(true);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
        {label}
      </h2>

      <div className="space-y-2">
        <PhoneInput
          value={value}
          onChange={handleChange}
          defaultCountry={defaultCountry}
          error={!!error}
          autoFocus
        />
        {touched && error && (
          <p className="text-sm text-destructive animate-fade-in">{error}</p>
        )}
      </div>
    </div>
  );
};
