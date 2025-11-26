import { useState, useEffect, useMemo } from 'react';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { useIsMobile } from '@/hooks/use-mobile';
import { defaultCountries, parseCountry } from 'react-international-phone';

const phoneUtil = PhoneNumberUtil.getInstance();

// Helper to get dial code for a country
const getDialCode = (countryCode: string): string => {
  const country = defaultCountries.find(c => parseCountry(c).iso2 === countryCode);
  if (country) {
    return parseCountry(country).dialCode;
  }
  return '';
};

// Helper to check if value is only the dial code (i.e., "empty")
const isOnlyDialCode = (value: string, countryCode: string): boolean => {
  if (!value) return true;
  const dialCode = getDialCode(countryCode);
  const normalized = value.replace(/[\s\-\(\)]/g, '');
  return normalized === `+${dialCode}` || normalized === dialCode;
};

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
  
  const isEmpty = useMemo(() => isOnlyDialCode(value, defaultCountry), [value, defaultCountry]);

  useEffect(() => {
    // Don't validate if not touched yet
    if (!touched) {
      onValidationChange(!isRequired);
      return;
    }

    // Treat dial-code-only as empty
    if (isEmpty) {
      if (isRequired) {
        setError('Please enter your phone number');
        onValidationChange(false);
      } else {
        setError('');
        onValidationChange(true);
        onSubmit('');
      }
      return;
    }

    // Validate the actual phone number
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
  }, [value, isRequired, touched, isEmpty, onValidationChange, onSubmit]);

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
