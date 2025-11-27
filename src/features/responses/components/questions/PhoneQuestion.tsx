import { useState, useEffect, useMemo } from 'react';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { useIsMobile } from '@/hooks/use-mobile';
import { defaultCountries, parseCountry } from 'react-international-phone';
import { SupportedLanguage } from '@/shared/constants/translations';
import { useQuestionTranslation } from '@/features/responses/hooks/useQuestionTranslation';
import { QuestionLabel } from './QuestionLabel';

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
  // Handle non-string values (null, undefined, objects like { _skipped: true })
  if (!value || typeof value !== 'string') return true;
  const dialCode = getDialCode(countryCode);
  const normalized = value.replace(/[\s\-\(\)]/g, '');
  return normalized === `+${dialCode}` || normalized === dialCode;
};

interface PhoneQuestionProps {
  label: string;
  description?: string;
  settings: any;
  initialValue?: string;
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  formLanguage?: SupportedLanguage;
}

export const PhoneQuestion = ({
  label,
  description,
  settings,
  initialValue = '',
  onSubmit,
  onValidationChange,
  formLanguage = 'en',
}: PhoneQuestionProps) => {
  const [value, setValue] = useState(() => {
    // Handle objects like { _skipped: true } or null/undefined
    if (typeof initialValue === 'string') return initialValue;
    return '';
  });
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const isMobile = useIsMobile();
  const defaultCountry = settings?.defaultCountry || 'us';
  const isRequired = settings?.required === true;
  const t = useQuestionTranslation(formLanguage);
  
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
        setError(t.enterPhoneNumber);
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
      setError(isValid ? '' : t.validPhoneNumber);
      onValidationChange(isValid);
      if (isValid) {
        onSubmit(value);
      }
    } catch {
      setError(t.validPhoneNumber);
      onValidationChange(false);
    }
  }, [value, isRequired, touched, isEmpty, onValidationChange, onSubmit, t.enterPhoneNumber, t.validPhoneNumber]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    if (!touched) {
      setTouched(true);
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
