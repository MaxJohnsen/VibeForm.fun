import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { enUS, nb, es, fr, de, pt, it, nl, sv, da, fi, pl, tr, ru, ar, ja, ko, zhCN } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { cn } from '@/lib/utils';
import { SupportedLanguage } from '@/shared/constants/translations';
import { QuestionLabel } from './QuestionLabel';
import { QuestionWrapper } from './QuestionWrapper';
import { useQuestionTranslation } from '../../hooks/useQuestionTranslation';

interface DateQuestionProps {
  label: string;
  description?: string;
  settings: any;
  initialValue?: string | { _skipped: boolean };
  onSubmit: (value: string) => void;
  onValidationChange: (isValid: boolean) => void;
  formLanguage?: SupportedLanguage;
}

// Map form languages to date-fns locales (only include available locales)
const getLocale = (language: SupportedLanguage = 'en'): Locale => {
  const localeMap: Partial<Record<SupportedLanguage, Locale>> = {
    en: enUS,
    no: nb,
    es,
    fr,
    de,
    pt,
    it,
    nl,
    sv,
    da,
    fi,
    pl,
    tr,
    ru,
    ar,
    ja,
    ko,
    zh: zhCN,
  };
  return localeMap[language] || enUS;
};

export const DateQuestion = ({
  label,
  description,
  settings,
  initialValue,
  onSubmit,
  onValidationChange,
  formLanguage = 'en',
}: DateQuestionProps) => {
  const [date, setDate] = useState<Date | undefined>(() => {
    // Handle skipped questions or non-string values
    if (typeof initialValue === 'string' && initialValue) {
      try {
        return new Date(initialValue);
      } catch {
        return undefined;
      }
    }
    return undefined;
  });
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const isRequired = settings?.required === true;
  const minDate = settings?.minDate ? new Date(settings.minDate) : undefined;
  const maxDate = settings?.maxDate ? new Date(settings.maxDate) : undefined;
  const disablePast = settings?.disablePast || false;
  const disableFuture = settings?.disableFuture || false;

  const locale = getLocale(formLanguage);
  const t = useQuestionTranslation(formLanguage);

  // Prevent auto-focus on mobile after navigation
  useEffect(() => {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.blur());
  }, []);

  // Validation effect
  useEffect(() => {
    const isValid = !isRequired || !!date;
    onValidationChange(isValid);

    if (touched) {
      if (isRequired && !date) {
        setError(t.required);
      } else {
        setError('');
      }
    }

    if (isValid && date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      onSubmit(formattedDate);
    }
  }, [date, isRequired, touched, onValidationChange, onSubmit]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setTouched(true);
    setDate(selectedDate);
  };

  // Determine which dates should be disabled in the calendar
  const disabledMatcher = (day: Date) => {
    const today = startOfDay(new Date());
    const dayStart = startOfDay(day);

    // Disable past dates
    if (disablePast && isBefore(dayStart, today)) {
      return true;
    }

    // Disable future dates
    if (disableFuture && isAfter(dayStart, today)) {
      return true;
    }

    // Disable dates before minDate
    if (minDate && isBefore(dayStart, startOfDay(minDate))) {
      return true;
    }

    // Disable dates after maxDate
    if (maxDate && isAfter(dayStart, startOfDay(maxDate))) {
      return true;
    }

    return false;
  };

  return (
    <QuestionWrapper>
      <QuestionLabel
        label={label}
        description={description}
        isRequired={isRequired}
        optionalText={t.optional}
      />

      <div className="space-y-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full px-4 py-3 sm:px-6 sm:py-4 text-base sm:text-lg bg-white/50 dark:bg-white/5 border rounded-xl focus:outline-none transition-all text-left flex items-center gap-2",
                error
                  ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20"
                  : "border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              )}
            >
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-muted-foreground" />
              {date ? (
                format(date, 'PPP', { locale })
              ) : (
                <span className="text-muted-foreground">{t.pickDate}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={disabledMatcher}
              initialFocus
              locale={locale}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {error && touched && (
          <p className="text-sm text-destructive animate-fade-in px-1">
            {error}
          </p>
        )}

        {!error && (minDate || maxDate || disablePast || disableFuture) && (
          <div className="text-xs text-muted-foreground px-1">
            {disablePast && t.noPastDates}
            {disableFuture && t.noFutureDates}
            {minDate && !disablePast && `${t.availableFrom} ${format(minDate, 'PP', { locale })}`}
            {maxDate && !disableFuture && ` ${t.until} ${format(maxDate, 'PP', { locale })}`}
          </div>
        )}
      </div>
    </QuestionWrapper>
  );
};
