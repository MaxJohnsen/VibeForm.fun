import { PhoneInput as RIPPhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { cn } from '@/lib/utils';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  defaultCountry?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export const PhoneInput = ({
  value,
  onChange,
  defaultCountry = 'us',
  disabled = false,
  error = false,
  className,
  autoFocus = false,
}: PhoneInputProps) => {
  return (
    <div className={cn('react-international-phone-wrapper', className)}>
      <RIPPhoneInput
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        inputClassName={cn(
          'w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg',
          'bg-white/50 dark:bg-white/5',
          'border rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          'transition-all',
          error 
            ? 'border-destructive focus:border-destructive' 
            : 'border-border/50 focus:border-primary'
        )}
        countrySelectorStyleProps={{
          buttonClassName: cn(
            'px-3 py-3 sm:py-4',
            'bg-white/50 dark:bg-white/5',
            'border border-border/50 rounded-l-xl',
            'hover:bg-white/70 dark:hover:bg-white/10',
            'transition-all',
            'focus:outline-none focus:ring-2 focus:ring-primary/20'
          ),
          dropdownStyleProps: {
            className: cn(
              'bg-background/95 backdrop-blur-xl',
              'border border-border/50 rounded-xl shadow-lg',
              'mt-2 z-50'
            ),
            listItemClassName: cn(
              'px-4 py-2 text-sm',
              'hover:bg-accent',
              'cursor-pointer transition-colors'
            ),
          },
        }}
      />
      
      <style>{`
        .react-international-phone-wrapper .react-international-phone-input-container {
          display: flex;
          gap: 0;
        }
        .react-international-phone-wrapper .react-international-phone-input-container input {
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-left: 0 !important;
        }
        .react-international-phone-wrapper .react-international-phone-country-selector-button {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
        }
      `}</style>
    </div>
  );
};
